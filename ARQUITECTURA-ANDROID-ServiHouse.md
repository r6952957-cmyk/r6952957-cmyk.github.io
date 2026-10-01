# ServiHouse Android nativa — Arquitectura y componentes clave

> Código escrito como plano de diseño. No se compiló aquí. Al crear el proyecto en Android Studio, usa las **últimas versiones estables** de cada librería (Kotlin, Compose BOM, Hilt, Room, Navigation, Material3). No copies versiones de memoria.

## 1. Stack
| Capa | Tecnología |
|---|---|
| Lenguaje | Kotlin + Coroutines + Flow (`StateFlow`, `Channel`) |
| UI | Jetpack Compose + Material 3 (color dinámico, claro/oscuro) |
| Adaptativo | `NavigationSuiteScaffold` (barra / riel / drawer según pantalla) + `GridCells.Adaptive` |
| Patrón | Clean Architecture + MVI |
| DI | Hilt (KSP) |
| Datos | Room (solicitudes, garantías), DataStore (preferencias) |
| Navegación | Navigation Compose con rutas `@Serializable` (type-safe) |
| Pruebas | JUnit, Turbine, MockK, Compose UI Test |

## 2. Estructura
```
ec.servihouse.app
├─ ServiHouseApp.kt            @HiltAndroidApp
├─ MainActivity.kt             @AndroidEntryPoint, setContent
├─ di/                         DbModule, RepoModule, DispatcherModule
├─ domain/                     (Kotlin puro, sin Android)
│  ├─ model/                   ServiceModule, ServiceRequest, Warranty
│  ├─ repository/              RequestRepository, WarrantyRepository
│  └─ usecase/                 SubmitRequestUseCase, ObserveWarrantiesUseCase
├─ data/
│  ├─ local/                   AppDb, RequestEntity, RequestDao
│  └─ repository/              RequestRepositoryImpl (mapea entity <-> domain)
└─ presentation/
   ├─ theme/                   Theme.kt, Type.kt
   ├─ navigation/              Destinations.kt, AppNav.kt
   ├─ home/                    HomeScreen (bloques de módulos)
   ├─ request/                 RequestContract, RequestViewModel, RequestScreen
   ├─ store/                   Equipos usados (consulta por WhatsApp)
   └─ warranty/                Garantías con barra de progreso
```
Regla de dependencias: `presentation → domain ← data`. `domain` no conoce Android, Room ni Compose.

## 3. Domain
```kotlin
enum class ServiceModule(val title: String, val emoji: String) {
    Appliances("Línea blanca", "🧺"), AirConditioning("Aires acondicionados", "❄️"),
    Solar("Energía renovable", "☀️"), Phones("Celulares", "📱"),
    BakeryCooling("Fríos de panadería", "🥖"), Cameras("Cámaras", "📹"),
    ElectricFences("Cercos eléctricos", "⚡"), ColdRooms("Cuartos fríos", "🧊")
}

data class ServiceRequest(
    val module: ServiceModule, val problem: String,
    val address: String, val slot: String
)

interface RequestRepository {
    fun history(): Flow<List<ServiceRequest>>
    suspend fun save(request: ServiceRequest)
}

class SubmitRequestUseCase @Inject constructor(private val repo: RequestRepository) {
    suspend operator fun invoke(r: ServiceRequest): Result<Unit> = runCatching {
        require(r.problem.isNotBlank()) { "Describe el problema" }
        repo.save(r)
    }
}
```

## 4. Data
```kotlin
@Entity(tableName = "requests")
data class RequestEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val module: String, val problem: String, val address: String,
    val slot: String, val createdAt: Long = System.currentTimeMillis()
)

@Dao interface RequestDao {
    @Query("SELECT * FROM requests ORDER BY createdAt DESC") fun all(): Flow<List<RequestEntity>>
    @Insert suspend fun insert(e: RequestEntity)
}

@Database(entities = [RequestEntity::class], version = 1)
abstract class AppDb : RoomDatabase() { abstract fun requestDao(): RequestDao }

class RequestRepositoryImpl @Inject constructor(
    private val dao: RequestDao, @IoDispatcher private val io: CoroutineDispatcher
) : RequestRepository {
    override fun history() = dao.all().map { l -> l.map {
        ServiceRequest(ServiceModule.valueOf(it.module), it.problem, it.address, it.slot) } }.flowOn(io)
    override suspend fun save(request: ServiceRequest) = withContext(io) {
        dao.insert(RequestEntity(module = request.module.name, problem = request.problem,
            address = request.address, slot = request.slot))
    }
}
```

## 5. Hilt
```kotlin
@HiltAndroidApp class ServiHouseApp : Application()

@Qualifier @Retention(AnnotationRetention.BINARY) annotation class IoDispatcher

@Module @InstallIn(SingletonComponent::class)
object DbModule {
    @Provides @Singleton fun db(@ApplicationContext c: Context) =
        Room.databaseBuilder(c, AppDb::class.java, "servihouse.db").build()
    @Provides fun dao(db: AppDb) = db.requestDao()
    @Provides @IoDispatcher fun io(): CoroutineDispatcher = Dispatchers.IO
}

@Module @InstallIn(SingletonComponent::class)
abstract class RepoModule {
    @Binds abstract fun requests(impl: RequestRepositoryImpl): RequestRepository
}
```

## 6. Presentation (MVI)
```kotlin
data class RequestState(
    val module: ServiceModule = ServiceModule.Appliances,
    val problem: String = "", val address: String = "",
    val sending: Boolean = false, val error: String? = null
)
sealed interface RequestIntent {
    data class PickModule(val m: ServiceModule) : RequestIntent
    data class EditProblem(val t: String) : RequestIntent
    data class EditAddress(val t: String) : RequestIntent
    data object Send : RequestIntent
}
sealed interface RequestEffect { data class OpenWhatsApp(val text: String) : RequestEffect }

@HiltViewModel
class RequestViewModel @Inject constructor(private val submit: SubmitRequestUseCase) : ViewModel() {
    private val _state = MutableStateFlow(RequestState())
    val state = _state.asStateFlow()
    private val _effects = Channel<RequestEffect>(Channel.BUFFERED)
    val effects = _effects.receiveAsFlow()

    fun onIntent(i: RequestIntent) {
        when (i) {
            is RequestIntent.PickModule -> _state.update { it.copy(module = i.m) }
            is RequestIntent.EditProblem -> _state.update { it.copy(problem = i.t, error = null) }
            is RequestIntent.EditAddress -> _state.update { it.copy(address = i.t) }
            RequestIntent.Send -> send()
        }
    }

    private fun send() = viewModelScope.launch {
        val s = _state.value
        _state.update { it.copy(sending = true) }
        submit(ServiceRequest(s.module, s.problem, s.address, "Hoy"))
            .onSuccess {
                _effects.send(RequestEffect.OpenWhatsApp(
                    "Hola ServiHouse, necesito ${s.module.title}: ${s.problem}. Dirección: ${s.address}"))
                _state.update { RequestState() }
            }
            .onFailure { e -> _state.update { it.copy(sending = false, error = e.message) } }
    }
}
```

### Tema (Material 3, color dinámico)
```kotlin
@Composable
fun ServiHouseTheme(dark: Boolean = isSystemInDarkTheme(), dynamic: Boolean = true,
                    content: @Composable () -> Unit) {
    val ctx = LocalContext.current
    val scheme = when {
        dynamic && Build.VERSION.SDK_INT >= 31 ->
            if (dark) dynamicDarkColorScheme(ctx) else dynamicLightColorScheme(ctx)
        dark -> darkColorScheme(primary = Color(0xFF6EA2FF), background = Color(0xFF00103D))
        else -> lightColorScheme(primary = Color(0xFF1E6BFF), background = Color(0xFFF3F7FF))
    }
    MaterialTheme(colorScheme = scheme, typography = AppTypography, content = content)
}
```

### Navegación adaptativa (móvil / tablet)
```kotlin
@Serializable data object Home
@Serializable data object Request
@Serializable data object Store
@Serializable data object Warranty

enum class Dest(val route: Any, val label: String, val icon: ImageVector) {
    H(Home, "Inicio", Icons.Default.Home), R(Request, "Servicio", Icons.Default.Build),
    S(Store, "Equipos", Icons.Default.ShoppingBag), W(Warranty, "Garantías", Icons.Default.Shield)
}

@Composable
fun AppNav() {
    val nav = rememberNavController()
    val current by nav.currentBackStackEntryAsState()
    NavigationSuiteScaffold(navigationSuiteItems = {
        Dest.entries.forEach { d ->
            item(selected = current?.destination?.hasRoute(d.route::class) == true,
                 onClick = { nav.navigate(d.route) { launchSingleTop = true; restoreState = true
                     popUpTo(nav.graph.findStartDestination().id) { saveState = true } } },
                 icon = { Icon(d.icon, null) }, label = { Text(d.label) })
        }
    }) {
        NavHost(nav, startDestination = Home) {
            composable<Home> { HomeScreen(onModule = { nav.navigate(Request) }) }
            composable<Request> { RequestScreen() }
            composable<Store> { StoreScreen() }
            composable<Warranty> { WarrantyScreen() }
        }
    }
}
```

### Home con bloques animados
```kotlin
@Composable
fun HomeScreen(onModule: (ServiceModule) -> Unit) {
    LazyVerticalGrid(columns = GridCells.Adaptive(160.dp),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)) {
        itemsIndexed(ServiceModule.entries) { i, m ->
            var shown by remember { mutableStateOf(false) }
            LaunchedEffect(Unit) { delay(i * 60L); shown = true }
            AnimatedVisibility(shown, enter = fadeIn() + slideInVertically { it / 3 } + scaleIn(initialScale = .9f)) {
                ElevatedCard(onClick = { onModule(m) }, Modifier.height(140.dp)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.SpaceBetween) {
                        Text(m.emoji, style = MaterialTheme.typography.displaySmall)
                        Text(m.title, style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }
    }
}
```

### Recolección segura en la pantalla
```kotlin
@Composable
fun RequestScreen(vm: RequestViewModel = hiltViewModel()) {
    val state by vm.state.collectAsStateWithLifecycle()
    val ctx = LocalContext.current
    LaunchedEffect(Unit) {
        vm.effects.collect { fx -> when (fx) {
            is RequestEffect.OpenWhatsApp -> ctx.startActivity(Intent(Intent.ACTION_VIEW,
                Uri.parse("https://wa.me/593939195170?text=" + Uri.encode(fx.text))))
        } }
    }
    // chips de ServiceModule + OutlinedTextField(problem/address) -> vm.onIntent(...)
}
```

## 7. Cómo encaja con lo que ya tienes
- Tu app actual (PWABuilder) **ya funciona** y se actualiza con solo subir el sitio. La nativa se reconstruye desde cero (pantallas, tienda, garantías) y cada cambio exige compilar y publicar una versión nueva.
- Para publicar en Play Store necesitas Android Studio, un `applicationId` (puedes reutilizar `ec.servihouse.app` solo si es la misma app de Play) y la **misma llave de firma** si reemplazas la app existente.
- Orden de trabajo sugerido: 1) proyecto base con tema, navegación y Home; 2) solicitud de servicio (MVI + WhatsApp); 3) tienda de equipos usados; 4) garantías con Room; 5) pruebas y R8.

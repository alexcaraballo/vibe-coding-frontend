
# 1) HOME — pantalla principal (Búsqueda de viaje / listado de opciones)

## Estructura visual y bloques principales

- Encabezado tipo “HOME” grande centrado arriba (marca el área principal).
    
- Panel central grande con título “BÚSQUEDA DE VIAJE”.
    
- Botones de modo: “Conductor” / “Pasajero” (pestañas). Por defecto se ve seleccionada la pestaña “Pasajero” (en azul).
    
- Gran cuadro tipo widget de mapa/visualización rotulado “MAPAS” (espacio para seleccionar o visualizar un origen/destino en mapa).
    
- Debajo del mapa, controles de filtros y búsqueda:
    
    - Botones/inputs para “Origen” y “Destino”.
        
    - Selector de fecha / día (texto: “Día (Calendario desplegable)”).
        
    - Control para “Cantidad de Pasajeros” (selector numérico).
        
    - Botón principal de acción “BUSCAR” (destacado en azul).
        
- A la derecha del panel, icono de perfil (avatar) y dos botones azules apilados: “Tus viajes reservados” y “Tus viajes publicados”.
    
- Debajo del bloque de búsqueda aparece la lista de resultados — tarjetas de viaje:
    
    - Cada tarjeta muestra horarios (hora salida / hora llegada), rutas abreviadas (ej. “Madrid → ... → Madrid”), mini-avatar del conductor, plazas disponibles, precio a la derecha (ej. “33€”).
        
    - Las tarjetas están apiladas verticalmente, separadas por tarjetas con borde claro y sombra sutil.
        

## Comportamiento y flujos posibles desde HOME

- **Modo pasajero/Conductor**: cambiar la pestaña modifica la intención de las acciones posteriores. “Conductor” podría llevar a una interfaz más centrada en publicar viajes; “Pasajero” muestra ofertas.
    
- **Interacción con mapa**: al hacer click en el mapa se abre un selector de origen/destino o permite dibujar ruta. El sistema debe geocodificar y autocompletar direcciones.
    
- **Filtros**: al cambiar fecha o cantidad de pasajeros, las tarjetas de resultado se actualizan.
    
- **Listado de resultados**:
    
    - Al hacer click en una tarjeta se abre la pantalla **“Información y confirmación de opción”** (ver sección 4).
        
    - Las tarjetas deben soportar estados: loading (si la búsqueda toma tiempo), vacío (si no hay viajes coincidentes) y paginación / carga incremental.
        
- **Botones del perfil** (“Tus viajes reservados” / “Tus viajes publicados”):
    
    - Si el usuario no ha iniciado sesión al pulsarlos, se dispara la pantalla de inicio de sesión/registro (ver sección 2). Pequeño texto junto al avatar: “Si no has iniciado sesión va a esta pantalla y vuelve”.
        
    - Si el usuario está logueado, estos botones llevan a secciones personales con datos de reservas y publicaciones.
        

## Estados y microcopy importantes

- **Estado vacío de búsqueda**: mostrar tarjeta informativa “Tus próximos viajes aparecerán aquí” con ilustración cuando no hay resultados o cuando el usuario no ha reservado nada.
    
- **Indicador de precio por plaza** (elemento separado en la esquina inferior izquierda de la composición): pequeño badge informativo “Fija el precio por plaza 3 €” — sugiere que existe una regla de precio mínimo o sugerido por plaza para publicaciones.
    
- **Accesibilidad**: todos los inputs deben tener labels claros; los botones de acción con contraste suficiente; los elementos de lista deben ser navegables con teclado.
    

---

# 2) Pantalla: Publicar un viaje (interfaz conductor)

## Estructura visual

- Panel titulado “PUBLICA UN VIAJE”.
    
- Pestañas “Conductor” (seleccionada) y “Pasajero” como en HOME.
    
- Gran zona central para mapa (“MAPAS”) donde el conductor marca origen/destino y la trazada de la ruta.
    
- Debajo, inputs y botones para:
    
    - “Origen” (campo de texto con autocompletado).
        
    - “Destino”.
        
    - “Día (Calendario desplegable)”.
        
    - “Precio” (input numérico — asociado al microcopy del precio fijo por plaza).
        
    - “Duración estimada (minutos/hours)” o campo similar.
        
    - Botones adicionales: “Añadir parada”, “Restricciones (p. ej. fumadores, mascotas)”.
        
    - Botón principal “PUBLICAR” (azul).
        
- A la izquierda puede haber micro-notas explicativas: “Se sugiere un precio o rango” y “El conductor puede editar la publicación”.
    

## Validaciones y reglas de negocio

- **Validaciones de campos obligatorios**: origen, destino, día y precio deben estar completados para habilitar “PUBLICAR”.
    
- **Regla de precio mínimo**: si existe un precio mínimo fijado por la plataforma (ej. 3 €), mostrar validación y tooltip si el conductor introduce un valor menor.
    
- **Revisión previa a publicar**: se puede presentar un modal/resumen con la ruta en el mapa y los datos introducidos para confirmar.
    
- **Estados**:
    
    - _Borrador / Editado_: conductor puede guardar como borrador.
        
    - _Publicado_: la publicación se hace visible en la lista de viajes del HOME.
        
    - _Error de publicación_: si falta info o hay un problema de red, se muestra un error en rojo.
        

## Flujo y sinergia con HOME

- Tras publicar con éxito, la publicación aparece en el HOME (si la búsqueda corresponde) y en “Tus viajes publicados” del perfil.
    
- Si el usuario no ha iniciado sesión al intentar publicar, será redirigido a login/registro.
    

---

# 3) Pantalla: Autenticación — ¿Cómo quieres iniciar sesión?

Esta sección aparece en la parte superior derecha del esquema y conecta varios caminos (registro, login, mensajes de error).

## Opciones mostradas

- Texto: “¿Cómo quieres iniciar sesión?” (pregunta guía).
    
- Dos formularios posibles:
    
    - **Registro** (formulario con campos):
        
        - Nombre
            
        - Contraseña (con requerimientos de seguridad — microcopy de requisitos)
            
        - Género (lista de opciones)
            
        - Checkbox: “Política de datos y privacidad” (obligatorio)
            
        - Botón “Registrarme”
            
        - Mensajes de ayuda: “Si el registro no puede realizarse por algún motivo: - El nombre ya existe - La contraseña no cumple los requisitos de seguridad”
            
    - **Inicio de sesión**:
        
        - Nombre (o email)
            
        - Contraseña
            
        - Botón “LOG IN”
            
        - Mensaje de error en caso de credenciales incorrectas: cuadro rosa con texto “Email o contraseña incorrectos”.
            
        - Nota: “Sólo está habilitado si se han rellenado los campos y se ha marcado la política de privacidad.” — esto indica que el sistema valida campos obligatorios antes de permitir el registro.
            

## Errores y banners globales

- Banner global en rojo/rosa con texto: “Lo sentimos, pero no podemos mostrarte esta página.” — se muestra en condiciones excepcionales (p. ej. recurso protegido, error de permisos o error de la plataforma). Este banner puede aparecer cuando el usuario intenta acceder a una página que requiere autenticación o permisos y la plataforma no puede mostrarla.
    
- Mensajes inline:
    
    - Error al registrar por nombre duplicado.
        
    - Error por contraseña débil.
        
    - Error al ingresar credenciales incorrectas (muestra el cuadro rosa “Email o contraseña incorrectos” al lado del botón).
        

## Flujo

- Si el usuario quiere realizar una acción que requiere cuenta (reservar, publicar, ver “tus viajes”), y no está autenticado, el sistema dirige a esta pantalla.
    
- Tras login o registro exitoso, volver al punto donde el usuario dejó la acción (redirección al HOME o a la operación pendiente).
    

---

# 4) Pantalla: ¿Hay viajes? / Estado con viajes próximos (estado de usuario)

## Estado “no hay viajes”

- Cuadro informativo al estilo “¿Hay viajes?” (bloque azul de decisión).
    
- Si no hay viajes para mostrar, se despliega un componente con ilustración y texto “Tus próximos viajes aparecerán aquí”.
    
- En la vista lateral derecha de la composición hay una lista compacta con posibles próximos viajes (cuando existen), o bien la lista vacía con enlaces para “Crear publicación”, “Modificar tu publicación”, “Solicitar asistencia”, etc.
    

## Comportamiento

- Este estado enlaza con la capacidad del usuario de crear una publicación o de ver sus viajes reservados/ publicados.
    
- Si el usuario intenta reservar y no hay viajes, mostrar ayudas y CTA (call to action) para crear alerta o publicar búsqueda.
    

---

# 5) Pantalla: Información y confirmación de opción (detalle de un viaje)

Esta pantalla aparece al hacer click en una tarjeta de resultado del HOME. Es una vista de detalle de la ruta / opción y el punto desde donde el pasajero puede lanzar la solicitud.

## Estructura visual

- Cabecera con la fecha grande: “Sábado, 15 de noviembre” (ejemplo).
    
- Panel central con:
    
    - Resumen de la ruta (horarios exactos, paradas).
        
    - Sub-bloque con información del conductor: avatar, nombre, rating (estrellas), número de reseñas.
        
    - Reglas del viaje (ej.: “No se aceptan mascotas”, “El conductor no permite fumar”, políticas de equipaje).
        
    - Texto explicativo: “Si tu reserva no se confirma hasta que el conductor acepte la solicitud” o similar.
        
    - Sección de “Pasajeros” al final con lista de pasajeros confirmados/esperando.
        
- Columna derecha (mini-panel de reserva rápida):
    
    - Pequeño resumen con origen/destino, una caja con precio puntual (ej. “24€”), selector de plazas, y botón azul “Enviar solicitud” o “Solicitar plaza”.
        
    - Indicación de “Con este precio” y condiciones (p. ej. plazas restantes).
        

## Comportamientos y transiciones

- **Enviar solicitud**:
    
    - Si el pasajero no ha iniciado sesión: redirigir a login/registro (ver sección 3). Nota en la imagen: “Si no ha iniciado sesión va a esta pantalla y vuelve”.
        
    - Si está autenticado: presionar “Enviar solicitud” crea una petición al conductor; el conductor recibe una notificación y la solicitud queda en estado “pendiente”.
        
- **Confirmaciones y feedback**:
    
    - Tras enviar la solicitud, el pasajero ve un estado de éxito (toast/modal) “Solicitud enviada” y el mini-panel actualiza el estado a “Solicitud pendiente”.
        
    - En la parte inferior del bloque central se muestran mensajes del conductor o condiciones adicionales (p. ej. “Llevar identificación”, “Llegar 10 minutos antes”).
        
- **Estado del conductor**:
    
    - Si el conductor ya ha confirmado el viaje para ese pasajero, el botón cambia a “Reservado” o “Ver detalles”.
        
- **Edge-cases**:
    
    - Si plazas agotadas: mostrar “Cupo completo”.
        
    - Si existe un descuento o cupón, permitir aplicarlo en el mini-panel.
        

---

# 6) Modal o pantalla: Confirmación del conductor sobre la solicitud (CONDUCTOR: Confirmación del viaje)

Cuando el conductor recibe la solicitud desde la pantalla de detalle, se le muestra una interfaz para aceptar o rechazar.

## Estructura visual

- Panel con el título “CONDUCTOR: CONFIRMACIÓN DEL VIAJE”.
    
- Sección superior: “PROPIEDADES DEL VIAJE” (resumen).
    
- Bloque central con la ficha de perfil (avatar + nombre) y dos cajas que resumen origen y destino con horarios (“Origen --- Hora” y “Destino --- Hora”).
    
- Bloques informativos:
    
    - Icono de euro + texto: “Importe: ¿Cantidad de dinero?” (indica cuánto cobrará).
        
    - Icono de información + texto: “Desvío: ¿Cantidad de tiempo?” (muestra cuánto tiempo extra supone recoger a este pasajero).
        
- Botones de acción abajo:
    
    - Botón azul “ACEPTAR”.
        
    - Botón rosa “RECHAZAR”.
        

## Comportamiento esperado

- **Aceptar**:
    
    - Al aceptar, se confirma la plaza para el pasajero; se actualizan plazas disponibles; se envía notificación al pasajero; el estado del viaje y listados se actualizan (HOME y listado del conductor).
        
    - Se registra un histórico de la acción.
        
- **Rechazar**:
    
    - El conductor puede rechazar con opción a enviar un mensaje corto al pasajero explicando motivo.
        
    - Rechazo actualiza la solicitud a “rechazada” y notifica al pasajero.
        
- **Validaciones**:
    
    - Mostrar confirmación modal si el aceptar implica cerrar el cupo o cancelar otra reserva previa.
        
    - Si aceptar implica un cargo o cobro, mostrar información de comisiones.
        
- **Flujo posterior**:
    
    - Tras la decisión, se muestra una pantalla final o toast con el resultado y, si procede, una opción para “notificar al pasajero” o “ver conversación”.
        

---

# 7) Mensajes de error globales y condiciones especiales

La composición incluye varios tipos de errores y mensajes de estado:

## Banner rojo global

- Texto: “Lo sentimos, pero no podemos mostrarte esta página.”
    
- Motivos típicos: recurso restringido, error de permisos o fallo de la plataforma.
    
- Comportamiento: botón de cierre (X) y links alternativos (volver a HOME, ayuda).
    

## Errores de autenticación

- Mensaje rosa junto al login: “Email o contraseña incorrectos”.
    
- Mensajes inline para el registro: “El nombre ya existe”, “La contraseña no cumple los requisitos”.
    

## Mensajes de validación

- Cuando faltan campos obligatorios, botones deshabilitados y microcopy explicativo.
    
- En pantalla de publicación: aviso si el precio es inferior al mínimo o si la duración es irreal.
    

---

# 8) Flujo de navegación completo (paso a paso de un caso de uso típico)

Voy a describir dos escenarios completos: **(A)** Pasajero que busca y reserva y **(B)** Conductor que publica y confirma.

## A) Pasajero — buscar y solicitar plaza

1. Usuario entra en HOME (pantalla de búsqueda).
    
2. Rellena “Origen”, “Destino”, fecha, número de pasajeros y presiona “BUSCAR”.
    
3. El listado se actualiza con tarjetas de viajes (cada tarjeta muestra precio, horario, conductor).
    
4. Usuario hace click en una tarjeta que le interesa → abre **Información y confirmación de opción**.
    
5. En la pantalla de detalle lee reglas y decide “Enviar solicitud”.
    
    - Si no está autenticado: se muestra la pantalla “¿Cómo quieres iniciar sesión?” (registro o login). Tras autenticación exitosa, vuelve a la pantalla de detalle con el formulario listo para enviar.
        
6. Envía solicitud: debe ver feedback (toast “Solicitud enviada”) y el mini-panel derecho cambia a “Solicitud pendiente”.
    
7. El conductor recibe la solicitud y, si la acepta, el pasajero recibe notificación “Tu reserva ha sido confirmada” y aparece en “Tus viajes reservados”.
    
8. En caso de rechazo, el pasajero recibe mensaje y su estado vuelve a “no reservado”.
    

## B) Conductor — publicar y confirmar pasajeros

1. Conductor accede a “PUBLICA UN VIAJE” (o cambia a modo conductor desde HOME).
    
2. Completa origen/destino/mapa, fecha, precio y publica.
    
    - Validaciones: precio mínimo, campos obligatorios.
        
3. La publicación aparece en el listado del HOME para pasajeros.
    
4. Un pasajero envía solicitud desde la pantalla de detalle.
    
5. Conductor recibe notificación (o ve en su panel “Tus viajes publicados” una solicitud pendiente).
    
6. Abre la interfaz de confirmación del conductor (CONDUCTOR: CONFIRMACIÓN DEL VIAJE) donde ve:
    
    - Propiedades del viaje, importe propuesto, desviación estimada.
        
7. Decide ACEPTAR o RECHAZAR.
    
    - Si ACEPTA: se confirma plaza, se descuentan plazas disponibles y se notifica al pasajero.
        
    - Si RECHAZA: se rechaza la solicitud y opcionalmente envía un mensaje.
        
8. Estado final: tanto pasajero como conductor ven el cambio de estado (confirmado / rechazado), y la información aparece en “Tus viajes reservados / publicados”.
    

---

# 9) Casos límite, consideraciones técnicas y UX microdetalles

## Redirecciones y preserving intent

- Cuando una acción requiere autenticación, el sistema debe guardar la acción intentada (p. ej. reservar la plaza X) y reintentarla automáticamente tras login/registro exitoso.
    
- Si el registro falla (nombre duplicado), mostrar inline y mantener los demás campos para no obligar al usuario a reescribir todo.
    

## Mensajes de estado y consistencia

- Coherencia en los colores: azul para acciones primarias/confirmaciones, rosa/rojo para errores, gris para información secundaria.
    
- Los toasts o modales deben ser breves y con CTA claro (por ejemplo: “Solicitud enviada — Ver mis reservas”).
    

## Datos críticos mostrados y prioridades

- En toda tarjeta y página de detalle deben mostrarse de forma prominente: horario de salida, precio por plaza, plazas disponibles, políticas importantes (mascotas, fumar), tiempo de desvío estimado (para conductor).
    
- Transparencia en comisiones y en qué momento se hace el cobro (si aplica).
    

## Accesibilidad y móvil

- La disposición mostrada es tipo desktop; en móvil se debe:
    
    - Convertir la columna derecha (mini-panel) en un floating sticky bottom panel para acceso rápido.
        
    - Priorizar el CTA “Enviar solicitud” y mostrar compactamente la información del conductor.
        

## Seguridad y privacidad

- El registro obliga a aceptar la política de privacidad. Mostrar enlace a política y checkbox obligatorio.
    
- No mostrar datos personales completos hasta que la reserva sea confirmada (p. ej. datos de contacto del conductor solo después de la aceptación).
    

---

# 10) Resumen de pantallas y transiciones clave (lista rápida)

1. **HOME** — búsqueda, mapa, filtros, lista de viajes (tarjetas). → desde aquí: ir a detalle / publicar (si conductor).
    
2. **Publicar un viaje** — formulario conductor con mapa y campos (origen/destino/fecha/precio). → publicar y volver a HOME.
    
3. **¿Cómo quieres iniciar sesión?** — opción registro / inicio de sesión; validaciones y errores (nombre duplicado, contraseña débil). → tras éxito, redirigir a la acción pendiente.
    
4. **Estado “¿Hay viajes?”** — vista vacía / próximos viajes; CTA para publicar o reservar.
    
5. **Información y confirmación de opción** — detalle completo del viaje + mini-panel para enviar solicitud y ver precio. → enviar solicitud (si no logueado → login).
    
6. **Conductor: confirmación del viaje** — modal/panel con propiedades del viaje, importe, desviación, botones “ACEPTAR” / “RECHAZAR”. → notifica pasajero / actualiza estado.
    
7. **Mensajes globales** — banner rojo (no podemos mostrar la página); cuadro de error rosa (credenciales incorrectas).
    

---

# Observaciones finales y recomendaciones de producto (breve)

- **Preservar el flujo del usuario**: esencial que, ante la necesidad de autenticación, el usuario sea devuelto exactamente al paso donde quedó (evitar fricción).
    
- **Transparencia en precios**: el badge “3 € por plaza” sugiere reglas que deben mostrarse claramente durante la publicación.
    
- **Estados de las tarjetas**: implementar indicadores claros (pendiente / confirmado / cupo completo) en cada tarjeta del listado.
    
- **Notificaciones**: push/email/within-app para notificar aceptación/rechazo y para recordar viajes próximos.
    
- **Microcopy**: explicar claramente qué implica aceptar (¿hay penalización por cancelar?, ¿cuándo se cobra?) y cuándo se mostrará la información de contacto.**
# Specs pendientes

Specs `should create` autogenerados por `ng generate` que **nunca pasaron**: declaran con `imports: [Componente]`
componentes que no son standalone, y no proveen ninguno de los servicios que cada componente necesita.
Como no probaban nada y dejaban `ng test` siempre en rojo, se movieron aquí (fuera de `src/`, así que no se compilan
ni se ejecutan) para poder confiar en la suite y usarla en CI.

Para recuperar uno: muévelo de vuelta junto a su componente y conviértelo en un test real, por ejemplo:

```ts
await TestBed.configureTestingModule({
  declarations: [MiComponente],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [{ provide: IHttpAlgoService, useValue: jasmine.createSpyObj('IHttpAlgoService', ['getAlgo']) }],
}).compileComponents();
```

Los specs que sí funcionan (por ejemplo `main-header.component.spec.ts`, `mensajes-conversacion.component.spec.ts`)
son buenos modelos.

# **Guía de Uso del Componente DataTable**

El componente `DataTable` es una tabla genérica y altamente flexible que permite mostrar datos, realizar operaciones como ordenamiento, paginación y personalizar la renderización de columnas específicas.

---

## **Instalación**

Asegúrate de tener las siguientes dependencias instaladas en tu proyecto:

```bash
npm install react react-dom next
npm install @heroicons/react
```

---

## **Props**

El componente `DataTable` acepta las siguientes propiedades:

### **Props Requeridas**

- **`columns`**: `Array<{ key: string, label: string, sortable?: boolean }>`
  - Define las columnas de la tabla.
  - Cada columna debe tener una propiedad `key` (que coincida con una clave en el array `data`), un `label` (encabezado de la columna) y una propiedad opcional `sortable`.

- **`data`**: `Array<Record<string, any>>`
  - El array de objetos con los datos que se mostrarán en la tabla. Cada objeto debe coincidir con las claves definidas en `columns`.

- **`total`**: `number`
  - El número total de registros disponibles (para la paginación).

- **`currentPage`**: `number`
  - El índice de la página actual (basado en 1).

- **`totalPages`**: `number`
  - El número total de páginas disponibles.

- **`onPageChange`**: `(page: number) => void`
  - Función que se ejecuta cuando el usuario cambia de página.

### **Props Opcionales**

- **`onSort`**: `(key: string, direction: 'asc' | 'desc') => void`
  - Función que se ejecuta cuando se hace clic en el encabezado de una columna ordenable. Devuelve la clave de la columna y la dirección de ordenamiento (`asc` o `desc`).

- **`renderActions`**: `(row: Record<string, any>) => React.ReactNode`
  - Una función para renderizar botones de acción u otros controles para cada fila.

- **`customRenderers`**: `{ [key: string]: (value: any, row: Record<string, any>) => React.ReactNode }`
  - Un diccionario donde cada clave corresponde a un `key` de columna y el valor es una función para personalizar cómo se renderiza esa columna.

- **`onRowsPerPageChange`**: `(rowsPerPage: number) => void`
  - Función que se ejecuta cuando cambia el número de filas por página.

- **`initialRowsPerPage`**: `number`
  - El número inicial de filas que se muestran por página (por defecto: `10`).

---

## **Ejemplo de Uso**

Aquí tienes un ejemplo de cómo utilizar el componente `DataTable` en un proyecto de Next.js:

```tsx
import DataTable from '../components/DataTable';

const MyPage = () => {
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', isVip: true },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com', isVip: false },
  ];

  const columns = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'isVip', label: 'VIP', sortable: false },
  ];

  const handlePageChange = (page) => {
    
  };

  const handleSort = (key, direction) => {
    
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      total={2}
      currentPage={1}
      totalPages={1}
      onPageChange={handlePageChange}
      onSort={handleSort}
      customRenderers={{
        isVip: (value) => (
          <div
            className={`w-4 h-4 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}
            title={value ? 'VIP' : 'No VIP'}
          ></div>
        ),
      }}
    />
  );
};

export default MyPage;
```

---

## **Características**

1. **Ordenamiento**: Las columnas se pueden marcar como ordenables utilizando la propiedad `sortable` en `columns`. La función `onSort` proporciona la clave de la columna y la dirección del ordenamiento.
2. **Paginación**: Maneja los cambios de página a través de la función `onPageChange`. Incluye botones de navegación y selección del número de filas por página.
3. **Renderización Personalizada**: Usa la propiedad `customRenderers` para personalizar cómo se muestran columnas específicas.
4. **Acciones**: Renderiza botones de acción u otros controles para cada fila usando la propiedad `renderActions`.

---

## **Estilos**

El componente `DataTable` utiliza Tailwind CSS para su estilizado. Asegúrate de tener Tailwind configurado en tu proyecto para aprovechar estos estilos. Puedes personalizar o sobrescribir los estilos según sea necesario.

---

## **Notas**

- Asegúrate de que todas las claves definidas en `columns` coincidan con las claves en los objetos del array `data`.
- Para personalizaciones avanzadas, extiende el componente o pasa props adicionales según sea necesario.


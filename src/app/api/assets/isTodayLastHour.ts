export function isToday(input: Date): boolean {
    // Fecha específica a verificar
    const inputDate = new Date(input);
    // Fecha y hora actuales
    const now = new Date();

    // Verificar si es hoy
    const isToday = inputDate.toDateString() === now.toDateString();

    return (isToday) 
}


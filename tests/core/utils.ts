

export const objectToForm = (o: object): FormData => {
    const form = new FormData()
    for (const [key, value] of Object.entries(o)) {
        form.append(key, value)
    }
    return form
}
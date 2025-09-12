describe("usePostObject()", () => {
    it("Parses body correctly", async () => {
        const form = new FormData()
        form.append("turbo", "Rigby")
        form.append("cat", "fast")
        form.append("Every Day", "I'm Shuffling")

        expect(
            await usePostObject(form)
        ).toStrictEqual({
            turbo: "Rigby",
            cat: "fast",
            "Every Day": "I'm Shuffling"
        })
    })
})
/* v8 ignore start */
class SimplePerformance {
    private now: number
    private steps: { [key: string]: number } = {}
    private currentStep: string | null = null

    constructor() {
        this.now = performance.now()
    }

    step = (name: string) => {
        if (this.currentStep) {
            this.steps[this.currentStep] = performance.now() - this.now
        }
        this.currentStep = name
        this.now = performance.now()
    }

    getSteps = () => {
        if (this.currentStep) {
            this.steps[this.currentStep] = performance.now() - this.now
        }
        return {
            ...this.steps,
            total: Object.values(this.steps).reduce((a, b) => a + b, 0)
        }
    }

    reset = () => {
        this.now = performance.now()
        this.steps = {}
        this.currentStep = null
    }
}

export const usePerformance = () => new SimplePerformance()
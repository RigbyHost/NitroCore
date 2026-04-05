/**
 * NitroCore - GDPS (Geometry Dash Private Server) implementation
 * Copyright (C) 2025 M41den <https://m41den.dev> and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
import {SDKCommands} from "~~/sdk/commands/SDKCommands";

const sdk = {
    commands: new SDKCommands()
}

export const useSDK = () => sdk

export {useCommandContext} from "~~/sdk/commands/context"
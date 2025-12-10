import {SDKCommands} from "~~/sdk/commands/SDKCommands";
import {SDKMusic} from "~~/sdk/music/SDKMusic";
import {SDKEvents} from "~~/sdk/events/SDKEvents";

const sdk = {
    commands: new SDKCommands(),
    music: new SDKMusic(),
    events: new SDKEvents()
}

export const useSDK = () => sdk

export {useCommandContext} from "~~/sdk/commands/context"
export {useMusicContext} from "~~/sdk/music/context"

export type {SDKMusicProvider} from "~~/sdk/music/types"
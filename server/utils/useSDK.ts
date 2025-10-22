import {SDKCommands} from "~~/sdk/commands/SDKCommands";
import {SDKMusic} from "~~/sdk/music/SDKMusic";

const sdk = {
    commands: new SDKCommands(),
    music: new SDKMusic()
}

export const useSDK = () => sdk

export {useCommandContext} from "~~/sdk/commands/context"
export {useMusicContext} from "~~/sdk/music/context"

export type {SDKMusicProvider} from "~~/sdk/music/types"
import config from "~~/nitro.config";
import {inject} from "vitest";

config.devStorage!.config = inject("config")
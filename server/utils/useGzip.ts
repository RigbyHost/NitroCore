import { gzip, gunzip, ZlibOptions } from 'zlib';
import { promisify } from 'util';

export const useGzip = () => ({
    gzip: promisify(gzip),
    ungzip: promisify(gunzip),
});
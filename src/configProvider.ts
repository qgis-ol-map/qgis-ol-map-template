import config from "../config/config";
import configOverride from "../config/configOverride";
import { mergeDeep } from "./utils/objectMerge";


export const getConfig = () => {
    return mergeDeep(config, configOverride);
}

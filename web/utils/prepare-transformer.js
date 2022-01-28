import { writeFile } from "fs/promises";
export function prepareTransformer(prefix) {
    return async function transform(path, html) {
        await writeFile(prefix + path, html.trim());
    };
}
//# sourceMappingURL=prepare-transformer.js.map
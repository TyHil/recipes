const or = (regexes, flags) => {
    return new RegExp(regexes.map((regex) => regex.source).join("|"), flags);
};
// single word ingredient: @eggs, @salt, ...
const ingredientSingle = /@(?<ingredientName>[^@#~ ]+)/;
// multiple word ingredient: @spicy guacamole{100%g}, ...
const ingredientMulti = /@(?<ingredientName_>[^@#~]+){(?<ingredientQuantity>[^}]*)}/; // prettier-ignore
// single word cookware: #pan, #pot, ...
const cookwareSingle = /#(?<cookwareName>[^@#~ ]+)/;
// multiple word cookware: #non-stick pan{}, ...
const cookwareMulti = /#(?<cookwareName_>[^@#~]+){(?<cookwareQuantity>[^}]*)}/;
// timer: ~{1%hour}, ~boil eggs{8%minutes} ...
const timerRegex = /~(?<timerName>[^@#~]*?){(?<timerQuantity>[^}]*)}/;
// metadata: >> key : value
const metadataRegex = /^>>\s*(?<metaKey>.*?):\s*(?<metaValue>.*)$/;
const lineComment = /--.*/;
const blockComment = /\[- .+ -]/;
const tokenRegex = or([
    metadataRegex,
    ingredientMulti,
    ingredientSingle,
    cookwareMulti,
    cookwareSingle,
    timerRegex,
], "g");
const commentRegex = or([lineComment, blockComment]);

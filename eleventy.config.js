import fs from "node:fs";
import markdownItAttrs from "markdown-it-attrs";

// The weights and styles of Montserrat the stylesheet uses, copied from @fontsource/montserrat into assets/fonts/.
// Only the Latin subset: every character on the site is in it.
const fonts = ["400-normal", "400-italic", "500-normal", "600-normal", "700-normal", "900-italic"];

// A heading's id as Python-Markdown's toc extension made it for the MkDocs site, so links to /bridges/#private-bridges
// and the like keep working: NFKD, drop what is not ASCII, remove anything but word characters, spaces and hyphens,
// trim, lowercase, and join the words with single hyphens.
const slugify = (text) =>
  text
    .normalize("NFKD")
    .replace(/[^\x00-\x7f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "-");

// A second heading with the same id gets "_1", a third "_2", and an empty id becomes "_1", as in Python-Markdown.
const unique = (id, ids) => {
  while (!id || ids.has(id)) {
    const m = id.match(/^(.*)_([0-9]+)$/);
    id = m ? `${m[1]}_${Number(m[2]) + 1}` : `${id}_1`;
  }
  ids.add(id);
  return id;
};

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("docs/assets");
  for (const font of fonts) {
    eleventyConfig.addPassthroughCopy({
      [`node_modules/@fontsource/montserrat/files/montserrat-latin-${font}.woff2`]: `assets/fonts/montserrat-latin-${font}.woff2`,
    });
  }
  // Files that keep the URLs they had on the MkDocs site: logos, documents and friends' logos under /public/ (from
  // MkDocs's theme/public/), page images under /images/, the IP geolocation feed, and the Tor relay well-known files
  // (Tor Proposal 326), which the relay and bridge pages also show.
  eleventyConfig.addPassthroughCopy("docs/public");
  eleventyConfig.addPassthroughCopy("docs/images");
  eleventyConfig.addPassthroughCopy("docs/geofeed.csv");
  eleventyConfig.addPassthroughCopy("docs/.well-known");
  // Rebuild when a fingerprint list changes, since the pages include them (see the fence rule below).
  eleventyConfig.addWatchTarget("docs/.well-known/");

  // The path from a page back to the site root, so every link and asset stays relative as in Larvatus:
  // "" on the home page, "../" one folder down.
  eleventyConfig.addFilter("root", (url) => "../".repeat(url.split("/").length - 2));
  // The id of a page's heading in the title band, made the same way as the ids of the headings in its Markdown.
  eleventyConfig.addFilter("headingId", (text) => unique(slugify(text), new Set()));
  // The site's navigation, docs/_data/nav.json, feeds the header links and their dropdowns, the phone menu, the footer
  // columns and sitemap.xml. (JSON has no comments, so its shape is described here.) It is a list of sections:
  //   { "label": "Services", "url": "/services/", "items": [ ... ] }
  // The section's label names it and links to its url, its own page. Its items are pages and groups, in order:
  //   a page:  { "label": "Tor Relays", "url": "/relays/" }   (a url starting http:// or https:// is another site)
  //   a group: { "group": "Tor", "items": [ pages ] }        (a label that is not a link, with pages under it)
  // These filters turn a section into what the templates draw.
  const external = (url) => /^https?:\/\//.test(url);
  // A section's items as groups: { label, id, pages }, where pages outside any group form a group without a label,
  // and each page says whether it is on another site.
  const navGroups = (section) => {
    const groups = [];
    let loose = null;
    for (const item of section.items || []) {
      if (item.group) {
        groups.push({ label: item.group, id: `${slugify(section.label)}-${slugify(item.group)}`,
          pages: item.items.map((p) => ({ ...p, external: external(p.url) })) });
        loose = null;
      } else {
        if (!loose) groups.push(loose = { label: null, pages: [] });
        loose.pages.push({ ...item, external: external(item.url) });
      }
    }
    return groups;
  };
  const navPages = (section) => navGroups(section).flatMap((g) => g.pages);
  eleventyConfig.addFilter("navGroups", navGroups);
  eleventyConfig.addFilter("navPages", navPages);
  // Every page of this site in the nav, in order (for sitemap.xml): each section's own page, then its pages here.
  eleventyConfig.addFilter("navUrls", (nav) =>
    nav.flatMap((s) => [s.url, ...navPages(s).filter((p) => !p.external).map((p) => p.url)]));
  // The nav section a page belongs to, if any.
  eleventyConfig.addFilter("section", (nav, url) => nav.find((s) => s.url === url || navPages(s).some((p) => p.url === url)));
  // How many grid rows a section spans on phones, where sections pack two across (see "Phones: sections pack" in
  // site.css). A group label right under the heading is shorter than one after other links, which has more space
  // above it. A label long enough to wrap in a column about 150px wide ("Monero Remote Node") needs more room. The
  // counts may round up: a section's content only has to fit in its rows.
  //   menu, 21px rows: heading 1, first label 2, other labels 2, link 2, wrapping label +1, gap 1
  //   footer, 15px rows: heading 2, first label 2, other labels 3, link 2, wrapping label +1, gap 2
  eleventyConfig.addFilter("packRows", (section, place) => {
    const groups = navGroups(section), pages = navPages(section);
    const labels = groups.filter((g) => g.label).length, first = groups[0]?.label ? 1 : 0;
    const long = pages.filter((p) => p.label.length > 16).length;
    return place === "menu"
      ? 1 + 2 * labels + 2 * pages.length + long + 1
      : 2 + 2 * first + 3 * (labels - first) + 2 * pages.length + long + 2;
  });
  // A pin of the home page's network map (from _data/locations.json) by its id.
  eleventyConfig.addFilter("pin", (pins, id) => pins.find((p) => p.id === id));

  eleventyConfig.amendLibrary("md", (md) => {
    // Attributes after an element, in braces: classes ({.button}, {.float}, {.note}), image sizes and lazy loading,
    // and the rel, target and title of links. Nothing else is allowed.
    md.use(markdownItAttrs, { allowedAttributes: ["class", "width", "height", "loading", "rel", "target", "title"] });
    md.set({ linkify: false, typographer: false });
    // markdown-it writes " in text as &quot;. Leave it as typed; it is only special inside attributes, which this rule
    // does not touch.
    const escape = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    md.renderer.rules.text = (tokens, i) => escape(tokens[i].content);

    // Heading ids as MkDocs made them (see slugify above). The text is the heading's rendered text without markup.
    md.core.ruler.push("heading_ids", (state) => {
      const ids = new Set();
      state.tokens.forEach((token, i) => {
        if (token.type !== "heading_open" || token.attrGet("id")) return;
        const text = state.tokens[i + 1].children
          .filter((t) => t.type === "text" || t.type === "code_inline")
          .map((t) => t.content)
          .join("");
        token.attrSet("id", unique(slugify(text), ids));
      });
    });

    // A fenced block whose info string is "include <path>" shows that file, relative to docs/, as a code block. It
    // replaces the --8<-- snippets MkDocs used for the relay and bridge fingerprint lists.
    const fence = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens, i, options, env, self) => {
      const info = tokens[i].info.trim();
      if (!info.startsWith("include ")) return fence(tokens, i, options, env, self);
      const file = fs.readFileSync(new URL(`docs/${info.slice(8).trim()}`, import.meta.url), "utf8");
      return `<pre><code>${escape(file)}</code></pre>\n`;
    };
  });

  return {
    // The pages live in docs/, where Larvatus uses src/: they keep the git paths they had under MkDocs, so their
    // history stays in one place (the Transparency page links to the signed commits of docs/transparency.md).
    dir: { input: "docs", output: "_site" },
    // Markdown pages are plain Markdown, not templates.
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}

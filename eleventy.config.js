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
  // The nav section (from _data/nav.json) that a page belongs to, if any.
  eleventyConfig.addFilter("section", (nav, url) => nav.find((s) => s.pages.some((p) => p.url === url)));
  // The pages to list under a section's heading. The heading links to the section's first page, so that page is left
  // out when its label is the section's own (About, Projects); "What We Do" stays under Services. Used for the header
  // dropdowns, the phone menu and the footer.
  eleventyConfig.addFilter("subpages", (section) =>
    section.pages[0].label === section.label ? section.pages.slice(1) : section.pages);
  // How many of a section's page labels are long enough to wrap onto two lines in a phone's two-across columns (the
  // header menu and the footer), about 150px wide: "Monero Remote Node" does, "Privacy Notice" does not. base.njk uses
  // it to size each section's grid rows so the sections pack (see "Phones: sections pack" in site.css).
  eleventyConfig.addFilter("longLabels", (pages) => pages.filter((p) => p.label.length > 16).length);
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

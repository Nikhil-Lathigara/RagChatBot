import * as cheerio from "cheerio";

export function extractPageContent(html, pageUrl, maxChars) {
  const $ = cheerio.load(html);

  $("script, style, noscript, iframe, svg, canvas").remove();

  const title = $("title").text().trim();

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  const links = new Set();

  $("a[href]").each((_, el) => {
    try {
      const url = new URL($(el).attr("href"), pageUrl).toString();
      links.add(url);
    } catch {}
  });

  return {
    title,
    text: bodyText.slice(0, maxChars),
    links: [...links],
  };
}
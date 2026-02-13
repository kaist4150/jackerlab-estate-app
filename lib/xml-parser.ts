// XML <item> 블록 추출
export function extractXmlItems(xml: string): string[] {
  const items: string[] = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    items.push(match[1]);
  }
  return items;
}

// XML 태그 값 추출 (여러 태그명 중 첫 매칭)
export function getXmlValue(itemXml: string, ...tags: string[]): string {
  for (const tag of tags) {
    const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
    const m = itemXml.match(regex);
    if (m) return m[1].trim();
  }
  return '';
}

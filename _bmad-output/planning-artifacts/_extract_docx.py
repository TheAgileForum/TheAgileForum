import zipfile
import xml.etree.ElementTree as ET

path = r"c:\Users\dhire\OneDrive\Documents\AgileForum\Requirement\The Agile Forum Product Requirements Document Prd.docx"
W_NS = "{http://schemas.openformats.org/wordprocessingml/2006/main}"

with zipfile.ZipFile(path) as z:
    xml = z.read("word/document.xml")

root = ET.fromstring(xml)
paras = []
for p in root.iter(f"{W_NS}p"):
    texts = []
    for t in p.iter(f"{W_NS}t"):
        if t.text:
            texts.append(t.text)
        if t.tail:
            texts.append(t.tail)
    line = "".join(texts).strip()
    if line:
        paras.append(line)

print("\n".join(paras))

(function () {
  "use strict";

  class BlockReader {
    /**
     * @param {string} text
     */
    constructor(text) {
      this.lines = text.split("\n");
      this.index = 0;
    }

    /**
     * @param {string[]} lines
     * @returns {[string[], number]}
     */
    read_block() {
      const block = [];
      while (this.index < this.lines.length) {
        if (this.lines[this.index].trim() === "") {
          this.index++;
          break;
        }
        block.push(this.lines[this.index++]);
      }
      return block;
    }

    peekLine() {
      return this.lines[this.index];
    }

    isEof() {
      return this.index >= this.lines.length;
    }
  }

  class DiaryBlock {
    /**
     * @param {string} title
     * @param {string[]} lines
     */
    constructor(title, lines) {
      this.title = title;
      this.lines = lines;
    }

    /**
     *
     * @param {BlockReader} r
     * @returns
     */
    static parse(r) {
      const block = r.read_block();
      const title = block[0];
      const lines = block.slice(1);
      return new DiaryBlock(title, lines);
    }
  }

  class DiaryEntry {
    /**
     * @param {string} title
     * @param {DiaryBlock[]} blocks
     * @param {string[] | null} text
     */
    constructor(title, blocks, text) {
      this.title = title;
      this.blocks = blocks;
      this.text = text;
    }

    /**
     * @param {string[]} lines
     * @returns {string}
     * @throws {Error}
     */
    static parseTitle(lines) {
      if (lines.length !== 1) {
        throw new Error(
          "Invalid diary entry: Expected lines to have one line, got: " +
            lines.length +
            " lines: " +
            lines.join("\n")
        );
      }
      if (!lines[0].startsWith("Entry:")) {
        throw new Error(
          "Invalid diary entry: Expected first line to start with 'Entry:', got: " +
            lines[0]
        );
      }
      return lines[0];
    }

    /**
     *
     * @param {string} line
     * @returns {boolean}
     */
    static isNewTitle(line) {
      return (
        line !== undefined &&
        line.startsWith("Entry:") &&
        line.includes("Year") &&
        line.includes("day")
      );
    }

    /**
     * @param {string} line
     * @returns {boolean}
     */
    static isBlockHeader(line) {
      return (
        line !== undefined &&
        ["Stats:", "Skills:", "Mutations:", "Kills:"].includes(line)
      );
    }

    /**
     * @param {BlockReader} r
     * @returns {DiaryEntry}
     * @throws {Error}
     */
    static parse(r) {
      const title = this.parseTitle(r.read_block());

      const blocks = [];
      while (!r.isEof() && this.isBlockHeader(r.peekLine())) {
        blocks.push(DiaryBlock.parse(r));
      }

      let text = [];
      while (!r.isEof() && !this.isNewTitle(r.peekLine())) {
        text = text.concat(r.read_block());
      }

      return new DiaryEntry(title, blocks, text);
    }
  }

  const parseDiary = (text) => {
    const r = new BlockReader(text);
    const entries = [];
    while (!r.isEof()) {
      entries.push(DiaryEntry.parse(r));
    }
    return entries;
  };

  /**
   *
   * @param {HTMLDivElement} $sidebar
   * @param {HTMLDivElement} $left
   * @param {HTMLDivElement} $right
   * @param {DiaryEntry[]} entries
   */
  const renderDiary = ($sidebar, $left, $right, entries) => {
    $sidebar.innerHTML = "";
    let requested = parseInt(window.location.hash.slice(1) || "0", 10);
    if (requested > entries.length - 1) {
      requested = 0;
    }

    for (const [index, entry] of entries.entries()) {
      const $entry = document.createElement("div");
      $entry.classList.add("entry");
      $entry.innerText = entry.title;

      if (index === requested) {
        $entry.classList.add("active");
        renderContent($left, $right, entry);
      }

      $entry.addEventListener("click", () => {
        for (const active of document.getElementsByClassName("entry active")) {
          active.classList.remove("active");
        }
        renderContent($left, $right, entry);
        $entry.classList.add("active");
        window.location.hash = index;
      });
      $sidebar.appendChild($entry);
    }
  };

  /**
   *
   * @param {HTMLDivElement} $target
   * @param {DiaryBlock} block
   * @param {string[]} lines
   */
  const renderBlock = ($target, block) => {
    const $block = document.createElement("div");
    $block.classList.add("block");

    const $title = document.createElement("h3");
    $title.innerText = block.title;
    $block.appendChild($title);

    const $content = document.createElement("div");
    $content.innerText = block.lines.join("\n");
    $content.classList.add("block-content");
    $block.appendChild($content);

    $target.appendChild($block);
  };

  /**
   * @param {HTMLDivElement} $left
   * @param {HTMLDivElement} $right
   * @param {DiaryEntry} entry
   */
  const renderContent = ($left, $right, entry) => {
    $left.innerHTML = "";
    $right.innerHTML = "";

    if (entry.blocks.length > 0) {
      for (const block of entry.blocks) {
        renderBlock($left, block);
      }
    } else {
      $left.innerHTML = "(No changes)";
    }

    if (entry.text !== null) {
      $right.innerHTML = DOMPurify.sanitize(
        marked.parse(entry.text.join("\n"))
      );
    }

    markCheckboxes($right);
  };

  const markCheckboxes = ($container) => {
    for (const $li of $container.getElementsByTagName("li")) {
      if (
        $li.children.length === 1 &&
        $li.children[0].tagName === "INPUT" &&
        $li.children[0].type === "checkbox"
      ) {
        $li.classList.add("checkbox");
      }
    }

    for (const $ul of $container.getElementsByTagName("ul")) {
      // If all children are checkboxes, add the container as checkbox
      if (
        Array.from($ul.children).every(
          (child) =>
            child.tagName === "LI" && child.classList.contains("checkbox")
        )
      ) {
        $ul.classList.add("checkbox");
      }
    }
  };

  const fetchAndRender = (url, $sidebar, $left, $right) => {
    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        const entries = parseDiary(text);
        renderDiary($sidebar, $left, $right, entries);
      });
  };

  const main = () => {
    const $form = document.getElementById("diary-url-form");
    const $diaryUrl = document.getElementById("diary-url");
    const $sidebar = document.getElementById("sidebar");
    const $left = document.getElementById("left");
    const $right = document.getElementById("right");

    const params = new URLSearchParams(window.location.search);
    if (params.has("diary-url")) {
      $diaryUrl.value = params.get("diary-url");
      fetchAndRender($diaryUrl.value, $sidebar, $left, $right);
    }

    // Navigate entries using up/down, j/k
    // Hacky AF, but there's only so much you can do without introducing a bunch of complexity
    document.addEventListener("keydown", (event) => {
      console.log(event.key);
      let offset = 0;
      if (event.key === "ArrowDown" || event.key === "j") {
        offset = 1;
      } else if (event.key === "ArrowUp" || event.key === "k") {
        offset = -1;
      }
      if (offset === 0) {
        return;
      }

      const active = document.getElementsByClassName("entry active")[0];
      if (active === undefined) {
        return;
      }

      const entries = document.getElementsByClassName("entry");
      const index = Array.from(entries).indexOf(active);
      const newIndex = (index + offset + entries.length) % entries.length;
      entries[newIndex].click();
    });
  };

  document.addEventListener("DOMContentLoaded", main);
})();

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var LanguageId;
(function(LanguageId2) {
  LanguageId2[LanguageId2["Null"] = 0] = "Null";
  LanguageId2[LanguageId2["PlainText"] = 1] = "PlainText";
})(LanguageId || (LanguageId = {}));
var FontStyle;
(function(FontStyle2) {
  FontStyle2[FontStyle2["NotSet"] = -1] = "NotSet";
  FontStyle2[FontStyle2["None"] = 0] = "None";
  FontStyle2[FontStyle2["Italic"] = 1] = "Italic";
  FontStyle2[FontStyle2["Bold"] = 2] = "Bold";
  FontStyle2[FontStyle2["Underline"] = 4] = "Underline";
  FontStyle2[FontStyle2["Strikethrough"] = 8] = "Strikethrough";
})(FontStyle || (FontStyle = {}));
var ColorId;
(function(ColorId2) {
  ColorId2[ColorId2["None"] = 0] = "None";
  ColorId2[ColorId2["DefaultForeground"] = 1] = "DefaultForeground";
  ColorId2[ColorId2["DefaultBackground"] = 2] = "DefaultBackground";
})(ColorId || (ColorId = {}));
var StandardTokenType;
(function(StandardTokenType2) {
  StandardTokenType2[StandardTokenType2["Other"] = 0] = "Other";
  StandardTokenType2[StandardTokenType2["Comment"] = 1] = "Comment";
  StandardTokenType2[StandardTokenType2["String"] = 2] = "String";
  StandardTokenType2[StandardTokenType2["RegEx"] = 3] = "RegEx";
})(StandardTokenType || (StandardTokenType = {}));
var MetadataConsts;
(function(MetadataConsts2) {
  MetadataConsts2[MetadataConsts2["LANGUAGEID_MASK"] = 255] = "LANGUAGEID_MASK";
  MetadataConsts2[MetadataConsts2["TOKEN_TYPE_MASK"] = 768] = "TOKEN_TYPE_MASK";
  MetadataConsts2[MetadataConsts2["BALANCED_BRACKETS_MASK"] = 1024] = "BALANCED_BRACKETS_MASK";
  MetadataConsts2[MetadataConsts2["FONT_STYLE_MASK"] = 30720] = "FONT_STYLE_MASK";
  MetadataConsts2[MetadataConsts2["FOREGROUND_MASK"] = 16744448] = "FOREGROUND_MASK";
  MetadataConsts2[MetadataConsts2["BACKGROUND_MASK"] = 4278190080] = "BACKGROUND_MASK";
  MetadataConsts2[MetadataConsts2["ITALIC_MASK"] = 2048] = "ITALIC_MASK";
  MetadataConsts2[MetadataConsts2["BOLD_MASK"] = 4096] = "BOLD_MASK";
  MetadataConsts2[MetadataConsts2["UNDERLINE_MASK"] = 8192] = "UNDERLINE_MASK";
  MetadataConsts2[MetadataConsts2["STRIKETHROUGH_MASK"] = 16384] = "STRIKETHROUGH_MASK";
  MetadataConsts2[MetadataConsts2["SEMANTIC_USE_ITALIC"] = 1] = "SEMANTIC_USE_ITALIC";
  MetadataConsts2[MetadataConsts2["SEMANTIC_USE_BOLD"] = 2] = "SEMANTIC_USE_BOLD";
  MetadataConsts2[MetadataConsts2["SEMANTIC_USE_UNDERLINE"] = 4] = "SEMANTIC_USE_UNDERLINE";
  MetadataConsts2[MetadataConsts2["SEMANTIC_USE_STRIKETHROUGH"] = 8] = "SEMANTIC_USE_STRIKETHROUGH";
  MetadataConsts2[MetadataConsts2["SEMANTIC_USE_FOREGROUND"] = 16] = "SEMANTIC_USE_FOREGROUND";
  MetadataConsts2[MetadataConsts2["SEMANTIC_USE_BACKGROUND"] = 32] = "SEMANTIC_USE_BACKGROUND";
  MetadataConsts2[MetadataConsts2["LANGUAGEID_OFFSET"] = 0] = "LANGUAGEID_OFFSET";
  MetadataConsts2[MetadataConsts2["TOKEN_TYPE_OFFSET"] = 8] = "TOKEN_TYPE_OFFSET";
  MetadataConsts2[MetadataConsts2["BALANCED_BRACKETS_OFFSET"] = 10] = "BALANCED_BRACKETS_OFFSET";
  MetadataConsts2[MetadataConsts2["FONT_STYLE_OFFSET"] = 11] = "FONT_STYLE_OFFSET";
  MetadataConsts2[MetadataConsts2["FOREGROUND_OFFSET"] = 15] = "FOREGROUND_OFFSET";
  MetadataConsts2[MetadataConsts2["BACKGROUND_OFFSET"] = 24] = "BACKGROUND_OFFSET";
})(MetadataConsts || (MetadataConsts = {}));
class TokenMetadata {
  static {
    __name(this, "TokenMetadata");
  }
  static getLanguageId(metadata) {
    return (metadata & 255) >>> 0;
  }
  static getTokenType(metadata) {
    return (metadata & 768) >>> 8;
  }
  static containsBalancedBrackets(metadata) {
    return (metadata & 1024) !== 0;
  }
  static getFontStyle(metadata) {
    return (metadata & 30720) >>> 11;
  }
  static getForeground(metadata) {
    return (metadata & 16744448) >>> 15;
  }
  static getBackground(metadata) {
    return (metadata & 4278190080) >>> 24;
  }
  static getClassNameFromMetadata(metadata) {
    const foreground = this.getForeground(metadata);
    let className = "mtk" + foreground;
    const fontStyle = this.getFontStyle(metadata);
    if (fontStyle & 1) {
      className += " mtki";
    }
    if (fontStyle & 2) {
      className += " mtkb";
    }
    if (fontStyle & 4) {
      className += " mtku";
    }
    if (fontStyle & 8) {
      className += " mtks";
    }
    return className;
  }
  static getInlineStyleFromMetadata(metadata, colorMap) {
    const foreground = this.getForeground(metadata);
    const fontStyle = this.getFontStyle(metadata);
    let result = `color: ${colorMap[foreground]};`;
    if (fontStyle & 1) {
      result += "font-style: italic;";
    }
    if (fontStyle & 2) {
      result += "font-weight: bold;";
    }
    let textDecoration = "";
    if (fontStyle & 4) {
      textDecoration += " underline";
    }
    if (fontStyle & 8) {
      textDecoration += " line-through";
    }
    if (textDecoration) {
      result += `text-decoration:${textDecoration};`;
    }
    return result;
  }
  static getPresentationFromMetadata(metadata) {
    const foreground = this.getForeground(metadata);
    const fontStyle = this.getFontStyle(metadata);
    return {
      foreground,
      italic: Boolean(
        fontStyle & 1
        /* FontStyle.Italic */
      ),
      bold: Boolean(
        fontStyle & 2
        /* FontStyle.Bold */
      ),
      underline: Boolean(
        fontStyle & 4
        /* FontStyle.Underline */
      ),
      strikethrough: Boolean(
        fontStyle & 8
        /* FontStyle.Strikethrough */
      )
    };
  }
}
export {
  ColorId,
  FontStyle,
  LanguageId,
  MetadataConsts,
  StandardTokenType,
  TokenMetadata
};
//# sourceMappingURL=encodedTokenAttributes.js.map

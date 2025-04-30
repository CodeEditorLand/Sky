var CursorChangeReason;
(function(CursorChangeReason2) {
  CursorChangeReason2[CursorChangeReason2["NotSet"] = 0] = "NotSet";
  CursorChangeReason2[CursorChangeReason2["ContentFlush"] = 1] = "ContentFlush";
  CursorChangeReason2[CursorChangeReason2["RecoverFromMarkers"] = 2] = "RecoverFromMarkers";
  CursorChangeReason2[CursorChangeReason2["Explicit"] = 3] = "Explicit";
  CursorChangeReason2[CursorChangeReason2["Paste"] = 4] = "Paste";
  CursorChangeReason2[CursorChangeReason2["Undo"] = 5] = "Undo";
  CursorChangeReason2[CursorChangeReason2["Redo"] = 6] = "Redo";
})(CursorChangeReason || (CursorChangeReason = {}));
export {
  CursorChangeReason
};
//# sourceMappingURL=cursorEvents.js.map

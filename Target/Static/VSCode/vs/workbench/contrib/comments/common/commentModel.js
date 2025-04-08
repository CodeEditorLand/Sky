var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { Comment, CommentThread, CommentThreadChangedEvent, CommentThreadApplicability, CommentThreadState } from "../../../../editor/common/languages.js";
class CommentNode {
  constructor(uniqueOwner, owner, resource, comment, thread) {
    this.uniqueOwner = uniqueOwner;
    this.owner = owner;
    this.resource = resource;
    this.comment = comment;
    this.thread = thread;
    this.threadId = thread.threadId;
    this.range = thread.range;
    this.threadState = thread.state;
    this.threadRelevance = thread.applicability;
    this.contextValue = thread.contextValue;
    this.controllerHandle = thread.controllerHandle;
    this.threadHandle = thread.commentThreadHandle;
  }
  static {
    __name(this, "CommentNode");
  }
  isRoot = false;
  replies = [];
  threadId;
  range;
  threadState;
  threadRelevance;
  contextValue;
  controllerHandle;
  threadHandle;
  hasReply() {
    return this.replies && this.replies.length !== 0;
  }
  _lastUpdatedAt;
  get lastUpdatedAt() {
    if (this._lastUpdatedAt === void 0) {
      let updatedAt = this.comment.timestamp || "";
      if (this.replies.length) {
        const reply = this.replies[this.replies.length - 1];
        const replyUpdatedAt = reply.lastUpdatedAt;
        if (replyUpdatedAt > updatedAt) {
          updatedAt = replyUpdatedAt;
        }
      }
      this._lastUpdatedAt = updatedAt;
    }
    return this._lastUpdatedAt;
  }
}
class ResourceWithCommentThreads {
  static {
    __name(this, "ResourceWithCommentThreads");
  }
  id;
  uniqueOwner;
  owner;
  ownerLabel;
  commentThreads;
  // The top level comments on the file. Replys are nested under each node.
  resource;
  constructor(uniqueOwner, owner, resource, commentThreads) {
    this.uniqueOwner = uniqueOwner;
    this.owner = owner;
    this.id = resource.toString();
    this.resource = resource;
    this.commentThreads = commentThreads.filter((thread) => thread.comments && thread.comments.length).map((thread) => ResourceWithCommentThreads.createCommentNode(uniqueOwner, owner, resource, thread));
  }
  static createCommentNode(uniqueOwner, owner, resource, commentThread) {
    const { comments } = commentThread;
    const commentNodes = comments.map((comment) => new CommentNode(uniqueOwner, owner, resource, comment, commentThread));
    if (commentNodes.length > 1) {
      commentNodes[0].replies = commentNodes.slice(1, commentNodes.length);
    }
    commentNodes[0].isRoot = true;
    return commentNodes[0];
  }
  _lastUpdatedAt;
  get lastUpdatedAt() {
    if (this._lastUpdatedAt === void 0) {
      let updatedAt = "";
      if (!this.commentThreads.length) {
        return updatedAt;
      }
      for (const thread of this.commentThreads) {
        const threadUpdatedAt = thread.lastUpdatedAt;
        if (threadUpdatedAt && threadUpdatedAt > updatedAt) {
          updatedAt = threadUpdatedAt;
        }
      }
      this._lastUpdatedAt = updatedAt;
    }
    return this._lastUpdatedAt;
  }
}
export {
  CommentNode,
  ResourceWithCommentThreads
};
//# sourceMappingURL=commentModel.js.map

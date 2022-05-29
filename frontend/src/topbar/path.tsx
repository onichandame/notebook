import { Lock, NoteAlt, Sync } from "@mui/icons-material";
import { ReactElement } from "react";

export class Path {
  private _parent?: Path;
  private _children?: Path[];
  constructor(
    public match: string,
    public title: string,
    public link: string,
    parent?: Path,
    public icon?: ReactElement,
  ) {
    this.parent = parent;
  }
  set parent(p: Path | undefined) {
    this._parent = p;
    if (p) {
      if (!p?._children) p._children = [];
      p._children.push(this);
    }
  }
  get parent() {
    return this._parent;
  }
  getChildren() {
    return this._children ? [...this._children] : this._children;
  }
  /** convert tree into list. must be called on the root node.
   *
   * @returns an array of nodes where root node is the last
   */
  toList() {
    return this._toList(true);
  }
  private _toList(root: boolean) {
    const result: Path[] = [];
    this._children?.forEach((child) => {
      result.push(...child._toList(false));
    });
    if (root || !this._children) result.push(this);
    return result;
  }
}

const home = new Path(`*`, `My Note`, `/`);
new Path(`/notes/*`, `Notes`, `/notes`, home, <NoteAlt />);
new Path(`/passwords/*`, `Passwords`, `/passwords`, home, <Lock />);
new Path(`/sync/*`, `Sync`, `/sync`, home, <Sync />);

export { home as root };

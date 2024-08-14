/**
 * Represents node of tree.
 * @template T Value of node.
 */
class TreeNode<T> {
    /** Child nodes of node. */
    public readonly children = new Array<TreeNode<T>>();
    /** Value of node. */
    public value : T;

    /**
     * Creates new tree node.
     * @param value Value of node.
     */
    constructor(value : T) {
        this.value = value;
    }
}

export default TreeNode;
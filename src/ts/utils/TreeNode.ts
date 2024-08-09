class TreeNode<T> {
    public readonly children = new Array<TreeNode<T>>();
    public value : T;

    constructor(value : T) {
        this.value = value;
    }
}

export default TreeNode;
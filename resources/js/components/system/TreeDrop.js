import React from "react";
import { render } from "react-dom";
import DropdownTreeSelect from "react-dropdown-tree-select";
import "../../../css/tree_dropdown.css";
import data from "./orgunits.json";
import '../../../css/drop_down.min.css'

const onChange = (currentNode, selectedNodes) => {
  console.log("path::", currentNode.path);
};

const assignObjectPaths = (obj, stack) => {
  Object.keys(obj).forEach(k => {
    const node = obj[k];
    if (typeof node === "object") {
      node.path = stack ? `${stack}.${k}` : k;
      assignObjectPaths(node, node.path);
    }
  });
};

export const TreeDrop = () => {
  assignObjectPaths(data);

  return (
    <DropdownTreeSelect
      data={data}
      onChange={onChange}
      className="bootstrap-demo"
    />
  );
};

export default TreeDrop;
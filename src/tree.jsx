'use strict';

var React = require('react');
var MaterialUI = require('material-ui');

var lodash = require('./vendor/lodash');
var filter = lodash.filter;
var find = lodash.find;
var merge = lodash.merge;
var assign = lodash.assign;
var contains = lodash.contains;
var forEach = lodash.forEach;
var reduce = lodash.reduce;
var bind = lodash.bind;

var TextField = MaterialUI.TextField;

var Tree = React.createClass({
  getInitialState: function() {
    return {
      data: this.props.data
    };
  },
  _createNodesRecursive: function(data, onTreeNodeClick, isChild) {
    var nodes = [];
    var isChild = isChild || false;
    var childNodes;
    var collapsed;
    forEach(data, bind(function(item) {
      childNodes = this._createNodesRecursive(item.children, onTreeNodeClick, true);
      nodes.push(<TreeNode className={!isChild ? 'tree-node-root' : 'tree-node-child'} onClick={onTreeNodeClick} text={item.name} treePath={item.path} childNodes={childNodes} collpsed={item.isCollapsed}/>);
    }, this));
    return nodes;
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      data: nextProps.data
    });
  },
  render: function() {
    var treeNodes = this._createNodesRecursive(this.state.data, this.props.onTreeNodeClick);
    return <ul className="list--tree">{treeNodes}</ul>;
  }
});

var TreeNode = React.createClass({
  getInitialState: function() {
    return {
      collapsed: !!this.props.collapsed,
      treePath: this.props.treePath
    };
  },
  handleClick: function(event) {
    event.stopPropagation();
    this.setState({
      collapsed: !this.state.collapsed
    });
    this.props.onClick(this.state.treePath);
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      treePath: nextProps.treePath
      //collapsed: nextProps.collapsed
    });
  },
  render: function() {
    var collapsedClass = this.state.collapsed === false ?  '' : ' collapsed';
    return <li className={this.props.className} key={this.state.treePath.toString()}>
      <ul className={collapsedClass}>{this.props.childNodes}</ul>
      <label onClick={this.handleClick}>{this.props.text}</label>
    </li>;
  }
});

module.exports = React.createClass({
  getInitialState: function() {
    return {
      data: this.props.data
    };
  },
  _searchSubTree: function(data, filterValue) {
    var isContaining = false;
    var subtreeContaining = false;

    if (!filterValue) return data;

    forEach(data, bind(function(item) {
      subtreeContaining = this._searchSubTree(item.children, filterValue, contains(item.name, filterValue));
      isContaining = isContaining || subtreeContaining || contains(item.name, filterValue);
    }, this));

    return isContaining;
  },
  _buildTreeTraversal: function(data, filterValue) {
    var result = {};

    if (!filterValue) return data;

    forEach(data, bind(function(item, key) {
      if (contains(item.name, filterValue) || this._searchSubTree(item.children, filterValue)) {
        result[key] = assign({}, item, {children: this._buildTreeTraversal(item.children, filterValue), isCollapsed: false});
      }
    }, this));

    return result;
  },
  _onFilterChange: function(event) {
    var filterValue = event.target.value;

    this.setState({
      filterValue: filterValue,
      data: this._buildTreeTraversal(this.props.data, filterValue)
    });
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      data: this._buildTreeTraversal(nextProps.data, this.state.filterValue)
    });
  },
  render: function() {
    return <div className={this.props.className}>
      <TextField hintText='Filter' floatingLabelText='Filter' onChange={this._onFilterChange} />
      <Tree onTreeNodeClick={this.props.onTreeNodeClick} data={this.state.data} />
    </div>;
  }

});


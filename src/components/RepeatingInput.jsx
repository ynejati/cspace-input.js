import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import { normalizeLabel } from './Label';
import MiniButton from './MiniButton';
import labelable from '../enhancers/labelable';
import getPath from '../helpers/getPath';
import repeatingInputStyles from '../../styles/cspace-input/RepeatingInput.css';
import moveToTopButtonStyles from '../../styles/cspace-input/MoveToTopButton.css';

function normalizeValue(value) {
  const defaultValue = [undefined];

  if (!value) {
    return defaultValue;
  }

  let normalized;

  if (Array.isArray(value)) {
    normalized = value;
  } else if (Immutable.List.isList(value)) {
    normalized = value.toArray();
  } else {
    normalized = [value];
  }

  if (normalized.length === 0) {
    return defaultValue;
  }

  return normalized;
}

class RepeatingInput extends Component {
  constructor(props) {
    super(props);

    this.handleInstanceCommit = this.handleInstanceCommit.bind(this);
    this.handleAddButtonClick = this.handleAddButtonClick.bind(this);
    this.handleMoveToTopButtonClick = this.handleMoveToTopButtonClick.bind(this);
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
  }

  getChildContext() {
    return {
      parentPath: getPath(this.props, this.context),
    };
  }

  handleAddButtonClick() {
    const {
      onAddInstance,
    } = this.props;

    if (onAddInstance) {
      onAddInstance(getPath(this.props, this.context));
    }
  }

  handleInstanceCommit(instancePath, value) {
    const {
      onCommit,
    } = this.props;

    if (onCommit) {
      onCommit(instancePath, value);
    }
  }

  handleMoveToTopButtonClick(event) {
    const {
      onMoveInstance,
    } = this.props;

    if (onMoveInstance) {
      const instanceName = event.target.dataset.instancename;
      const newPosition = 0;

      onMoveInstance([...getPath(this.props, this.context), instanceName], newPosition);
    }
  }

  handleRemoveButtonClick(event) {
    const {
      onRemoveInstance,
    } = this.props;

    if (onRemoveInstance) {
      const instanceName = event.target.dataset.instancename;

      onRemoveInstance([...getPath(this.props, this.context), instanceName]);
    }
  }

  renderHeader() {
    const {
      children,
    } = this.props;

    const template = React.Children.only(children);

    const {
      label,
    } = template.props;

    const normalizedLabel = normalizeLabel(label);

    if (!label) {
      return null;
    }

    return (
      <header>
        <div />
        <div>
          {normalizedLabel}
        </div>
        <div />
      </header>
    );
  }

  renderInstances() {
    const {
      children,
      value,
    } = this.props;

    const template = React.Children.only(children);
    const childPropTypes = template.type.propTypes;

    return normalizeValue(value).map((instanceValue, index, list) => {
      const instanceName = `${index}`;

      const overrideProps = {
        embedded: true,
        label: undefined,
        name: instanceName,
        value: instanceValue,
      };

      if (childPropTypes) {
        if (childPropTypes.onCommit) {
          overrideProps.onCommit = this.handleInstanceCommit;
        }
      }

      const instance = React.cloneElement(template, overrideProps);

      return (
        <div key={index}>
          <div>
            <MiniButton
              className={moveToTopButtonStyles.common}
              data-instancename={instanceName}
              disabled={index === 0}
              name="moveToTop"
              onClick={this.handleMoveToTopButtonClick}
            >
              {index + 1}
            </MiniButton>
          </div>
          <div>
            {instance}
          </div>
          <div>
            <MiniButton
              data-instancename={instanceName}
              disabled={list.length < 2}
              name="remove"
              onClick={this.handleRemoveButtonClick}
            >
              −
            </MiniButton>
          </div>
        </div>
      );
    });
  }

  render() {
    const {
      name,
    } = this.props;

    const header = this.renderHeader();
    const instances = this.renderInstances();

    return (
      <fieldset
        className={repeatingInputStyles.common}
        name={name}
      >
        <div>
          {header}
          {instances}
        </div>
        <footer>
          <div>
            <MiniButton
              name="add"
              onClick={this.handleAddButtonClick}
            >
              +
            </MiniButton>
          </div>
        </footer>
      </fieldset>
    );
  }
}

RepeatingInput.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.instanceOf(Immutable.List),
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ])),
  ]),
  onAddInstance: PropTypes.func,
  onCommit: PropTypes.func,
  onMoveInstance: PropTypes.func,
  onRemoveInstance: PropTypes.func,
};

RepeatingInput.contextTypes = {
  defaultSubpath: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  parentPath: PropTypes.arrayOf(PropTypes.string),
};

RepeatingInput.childContextTypes = {
  parentPath: PropTypes.arrayOf(PropTypes.string),
};

export default labelable(RepeatingInput);

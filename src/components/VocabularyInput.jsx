import React from 'react';
import PropTypes from 'prop-types';
import BasePrefixFilteringDropdownMenuInput from './PrefixFilteringDropdownMenuInput';
import withLabeledOptions from '../enhancers/withLabeledOptions';

const PrefixFilteringDropdownMenuInput = withLabeledOptions(BasePrefixFilteringDropdownMenuInput);

const propTypes = {
  formatVocabularyLabel: PropTypes.func,
  recordTypes: PropTypes.object,
  recordType: PropTypes.string,
  rootVocabulary: PropTypes.string,
  value: PropTypes.string,
};

const defaultProps = {
  formatVocabularyLabel: (name, config) => {
    const messages = config.messages;

    if (messages) {
      return messages.name.defaultMessage;
    }

    return name;
  },
  rootVocabulary: 'all',
};

export default function VocabularyInput(props) {
  const {
    formatVocabularyLabel,
    recordTypes,
    recordType,
    rootVocabulary,
    value: vocabularyValue,
    ...remainingProps
  } = props;

  if (
    !recordType ||
    !recordTypes[recordType] ||
    !recordTypes[recordType].vocabularies
  ) {
    return null;
  }

  const vocabularies = recordTypes[recordType].vocabularies;
  const options = [];

  if (vocabularies[rootVocabulary]) {
    options.push({
      value: rootVocabulary,
      label: formatVocabularyLabel(rootVocabulary, vocabularies[rootVocabulary]),
    });
  }

  const vocabularyNames = Object.keys(vocabularies)
    .filter(
      vocabularyName => vocabularyName !== rootVocabulary &&
      !vocabularies[vocabularyName].disabled
    )
    .sort((nameA, nameB) => {
      const configA = vocabularies[nameA];
      const configB = vocabularies[nameB];

      // Primary sort by sortOrder

      let sortOrderA = configA.sortOrder;
      let sortOrderB = configB.sortOrder;

      if (typeof sortOrderA !== 'number') {
        sortOrderA = Number.MAX_VALUE;
      }

      if (typeof sortOrderB !== 'number') {
        sortOrderB = Number.MAX_VALUE;
      }

      if (sortOrderA !== sortOrderB) {
        return (sortOrderA > sortOrderB ? 1 : -1);
      }

      // Secondary sort by label

      const labelA = formatVocabularyLabel(nameA, configA);
      const labelB = formatVocabularyLabel(nameB, configB);

      // FIXME: This should be locale aware
      return labelA.localeCompare(labelB);
    });

  vocabularyNames.forEach((vocabularyName) => {
    options.push({
      indent: 1,
      value: vocabularyName,
      label: formatVocabularyLabel(vocabularyName, vocabularies[vocabularyName]),
    });
  });

  let value = vocabularyValue;

  if (!value) {
    for (let i = 0; i < vocabularyNames.length; i += 1) {
      const vocabularyName = vocabularyNames[i];
      const vocabulary = vocabularies[vocabularyName];

      if (vocabulary.defaultForSearch) {
        value = vocabularyName;
        break;
      }
    }

    if (!value && options.length > 0) {
      value = options[0].value;
    }
  }

  return (
    <PrefixFilteringDropdownMenuInput
      blankable={false}
      options={options}
      value={value}
      {...remainingProps}
    />
  );
}

VocabularyInput.propTypes = propTypes;
VocabularyInput.defaultProps = defaultProps;

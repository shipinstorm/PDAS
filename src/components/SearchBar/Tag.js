import { useEffect, useState } from "react";

export default function Tag({
  index,
  value,
  removeTag,
  editTagIndex,
  setEditTagIndex,
  autoCompleteValue,
  handleAutoCompleteValueChange
}) {
  const [inputValue, setInputValue] = useState(value.title);

  useEffect(() => {
    setInputValue(value.title);
  }, [value.title])

  const updateValue = () => {
    setEditTagIndex(-1);

    if (value === inputValue) return;

    let newValue = autoCompleteValue;
    newValue[index].title = inputValue;
    handleAutoCompleteValueChange(newValue);
  }

  const inputKeyDownHandle = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      updateValue();
    }
  }

  return (
    <div className="autocomplete-tag">
      <span
        className="autocomplete-tag-close"
        onClick={() => {
          removeTag(value.header, value.title);
          setEditTagIndex(-1);
        }}
      >
        &times;
      </span>
      <span
        className="autocomplete-tag-header"
        onClick={() => setEditTagIndex(index)}
      >
        |&nbsp;{value.header ? value.header + ': ' : value.header}
      </span>
      {
        editTagIndex !== index &&
        <span
          aria-label="autocomplete-tag-title"
          onClick={() => setEditTagIndex(index)}
        >
          {value.title}
        </span>
      }
      {
        editTagIndex === index &&
        <input
          id="tags-bar"
          type="text"
          value={inputValue}
          onBlur={() => updateValue()}
          onKeyDown={(e) => inputKeyDownHandle(e)}
          onChange={(e) => setInputValue(e.target.value)}
        />
      }
    </div>
  )
}

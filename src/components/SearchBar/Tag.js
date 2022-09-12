function Tag({
  value,
  removeTag
}) {
  return (
    <div className="autocomplete-tag">
      <span className="autocomplete-tag-close" onClick={() => removeTag(value.header, value.title)}>&times;</span>
      <span className="autocomplete-tag-header">|&nbsp;{value.header}:&nbsp;</span>
      <span aria-label="autocomplete-tag-title">{value.title}</span>
    </div>
  )
}

export default Tag;
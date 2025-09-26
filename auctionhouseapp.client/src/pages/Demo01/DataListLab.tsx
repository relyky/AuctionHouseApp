import React from 'react';
import './DataListLab.css';

export default function DataListLab() {
  const labelText = "Choose a flavor";

  return (
    <div className="custom-autocomplete-container">
      <div className="input-wrapper">
        <input
          id="ice-cream-choice"
          name="ice-cream-choice"
          className="custom-input"
          list="ice-cream-flavors"
          placeholder=" " // 繼續用於觸發浮動標籤
        />
        <label htmlFor="ice-cream-choice" className="custom-label">
          {labelText}
        </label>
        {/* 這個 fieldset 用來繪製外框和缺口 */}
        <fieldset aria-hidden="true" className="custom-fieldset">
          <legend className="custom-legend">
            {/* legend 內的文字寬度決定了缺口的大小 */}
            <span>{labelText}</span>
          </legend>
        </fieldset>
      </div>

      <datalist id="ice-cream-flavors">
        <option value="Chocolate" />
        <option value="Coconut" />
        <option value="Mint" />
        <option value="Strawberry" />
        <option value="Vanilla" />
        <option value="Chocolate A" />
        <option value="Coconut A" />
        <option value="Mint A" />
        <option value="Strawberry A" />
        <option value="Vanilla A" />
        <option value="Chocolate B" />
        <option value="Coconut B" />
        <option value="Mint B" />
        <option value="Strawberry B" />
        <option value="Vanilla B" />
      </datalist>
    </div>
  );
}

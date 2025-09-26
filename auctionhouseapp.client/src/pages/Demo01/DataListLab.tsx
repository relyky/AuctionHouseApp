import React from 'react';
import './DataListLab.css'; // 繼續使用 CSS 來美化輸入框

export default function DataListLab() {
  return (
    <div className="custom-autocomplete-container">
      <div className="input-wrapper">
        <input
          id="ice-cream-choice"
          name="ice-cream-choice"
          className="custom-input"
          list="ice-cream-flavors" // 重新連接到 datalist
          // 依然需要 placeholder 來觸發浮動標籤的 CSS
          placeholder=" "
        />
        <label htmlFor="ice-cream-choice" className="custom-label">
          Choose a flavor
        </label>
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

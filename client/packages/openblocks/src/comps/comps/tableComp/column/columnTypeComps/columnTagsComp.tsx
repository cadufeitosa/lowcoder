import { Tag } from "antd";
import { PresetColorTypes } from "antd/lib/_util/colors";
import { TagsContext } from "components/table/EditableCell";
import {
  ColumnTypeCompBuilder,
  ColumnTypeViewFn,
} from "comps/comps/tableComp/column/columnTypeCompBuilder";
import { ColumnValueTooltip } from "comps/comps/tableComp/column/simpleColumnTypeComps";
import { codeControl } from "comps/controls/codeControl";
import { trans } from "i18n";
import styled from "styled-components";
import _ from "lodash";
import { ReactNode, useContext, useState } from "react";
import { toJson } from "really-relaxed-json";
import { hashToNum } from "util/stringUtils";
import { CustomSelect, PackUpIcon } from "openblocks-design";
import { ScrollBar } from "openblocks-design";

const colors = PresetColorTypes;

const isStringArray = (value: any) => {
  return (
    _.isArray(value) &&
    value.every((v) => {
      const type = typeof v;
      return type === "string" || type === "number" || type === "boolean";
    })
  );
};

// accept string, number, boolean and array input
const TagsControl = codeControl<Array<string> | string>(
  (value) => {
    if (isStringArray(value)) {
      return value;
    }
    const valueType = typeof value;
    if (valueType === "string") {
      try {
        const result = JSON.parse(toJson(value));
        if (isStringArray(result)) {
          return result;
        }
        return value;
      } catch (e) {
        return value;
      }
    } else if (valueType === "number" || valueType === "boolean") {
      return value;
    }
    throw new TypeError(
      `Type "Array<string> | string" is required, but find value: ${JSON.stringify(value)}`
    );
  },
  { expectedType: "string | Array<string>", codeType: "JSON" }
);

function getTagColor(text: string) {
  const index = Math.abs(hashToNum(text)) % colors.length;
  return colors[index];
}

const childrenMap = {
  text: TagsControl,
};

const getBaseValue: ColumnTypeViewFn<typeof childrenMap, string | string[], string | string[]> = (
  props
) => props.text;

type TagEditPropsType = {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onChangeEnd: () => void;
};

export const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  background: transparent !important;
  > div {
    width: 100%;
    height: 100%;
  }
  .ant-select {
    height: 100%;
    .ant-select-selector {
      padding: 0 7px;
      height: 100%;
      overflow: hidden;
      .ant-select-selection-item {
        display: inline-flex;
        align-items: center;
        padding-right: 24px;
      }
    }
    .ant-select-arrow {
      height: calc(100% - 3px);
      width: fit-content;
      top: 1.5px;
      margin-top: 0;
      background-color: white;
      right: 1.5px;
      border-right: 1px solid #d7d9e0;
      svg {
        min-width: 18px;
        min-height: 18px;
      }
    }
    .ant-select-selector .ant-select-selection-search {
      left: 7px;
      input {
        height: 100%;
      }
    }
    &.ant-select-open {
      .ant-select-arrow {
        border-right: none;
        border-left: 1px solid #d7d9e0;
        svg g path {
          fill: #315efb;
        }
      }
      .ant-select-selection-item {
        opacity: 0.4;
      }
    }
  }
`;

export const DropdownStyled = styled.div`
  .ant-select-item {
    padding: 3px 8px;
    margin: 0 0 2px 8px;
    border-radius: 4px;
  }
  .ant-select-item-option-content {
    display: flex;
    align-items: center;
  }
  .ant-tag {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: keep-all;
    margin-right: 0;
  }
`;

const TagEdit = (props: TagEditPropsType) => {
  const defaultTags = useContext(TagsContext);
  const [tags, setTags] = useState(defaultTags);
  return (
    <Wrapper>
      <CustomSelect
        autoFocus
        defaultOpen
        bordered={false}
        optionLabelProp="children"
        showArrow
        showSearch
        defaultValue={props.value}
        style={{ width: "100%" }}
        suffixIcon={<PackUpIcon />}
        onSearch={(value) => {
          if (defaultTags.findIndex((item) => item.includes(value)) < 0) {
            setTags([...defaultTags, value]);
          } else {
            setTags(defaultTags);
          }
        }}
        onChange={(value) => {
          props.onChange(value);
        }}
        dropdownRender={(originNode: ReactNode) => (
          <DropdownStyled>
            <ScrollBar style={{ maxHeight: "256px" }}>{originNode}</ScrollBar>
          </DropdownStyled>
        )}
        dropdownStyle={{ marginTop: "7px", padding: "8px 0 6px 0" }}
        onBlur={props.onChangeEnd}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            props.onChangeEnd();
          }
        }}
      >
        {tags.map((value, index) => (
          <CustomSelect.Option value={value} key={index}>
            <Tag color={getTagColor(value)} key={index}>
              {value}
            </Tag>
          </CustomSelect.Option>
        ))}
      </CustomSelect>
    </Wrapper>
  );
};

export const ColumnTagsComp = (function () {
  return new ColumnTypeCompBuilder(
    childrenMap,
    (props, dispatch) => {
      const value = props.changeValue ?? getBaseValue(props, dispatch);
      const tags = _.isArray(value) ? value : [value];
      const view = tags.map((tag, index) => {
        // The actual eval value is of type number or boolean
        const tagText = String(tag);
        return (
          <Tag color={getTagColor(tagText)} key={index}>
            {tagText}
          </Tag>
        );
      });
      return view;
    },
    (nodeValue) => {
      const text = nodeValue.text.value;
      return _.isArray(text) ? text.join(",") : text;
    },
    getBaseValue
  )
    .setEditViewFn((props) => (
      <TagEdit value={props.value} onChange={props.onChange} onChangeEnd={props.onChangeEnd} />
    ))
    .setPropertyViewFn((children) => (
      <>
        {children.text.propertyView({
          label: trans("table.columnValue"),
          tooltip: ColumnValueTooltip,
        })}
      </>
    ))
    .build();
})();

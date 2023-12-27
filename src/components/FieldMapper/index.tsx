import React, { ChangeEvent, useCallback, useState, useEffect } from "react";
import styles from "./FieldMapper.module.css";
import { FieldList, FieldMap } from "../../types";

type FieldRowProps = {
  field: string;
  index: number;
  onFieldSelect: (index: number, field: keyof typeof FieldList) => void;
};

const FieldRow = ({ field, index, onFieldSelect }: FieldRowProps) => {
  const onSelectChanged = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    onFieldSelect(index, value as keyof typeof FieldList);
  }, []);
  return (
    <React.Fragment>
      <div className={styles.fieldName}>{field}</div>
      <div className={styles.select}>
        <select onChange={onSelectChanged}>
          <option value="">Select field</option>
          {(Object.keys(FieldList) as (keyof typeof FieldList)[]).map(
            (field) => (
              <option value={field}>{FieldList[field]}</option>
            )
          )}
        </select>
      </div>
    </React.Fragment>
  );
};

type FieldMapperProps = {
  fields: Array<string>;
  onFieldsMapped: (fieldMap: FieldMap | undefined) => void;
};

const FieldMapper = ({ fields, onFieldsMapped }: FieldMapperProps) => {
  const [fieldMap, setFieldMap] = useState<FieldMap>();
  const onFieldSelect = useCallback(
    (index: number, field: keyof typeof FieldList) => {
      setFieldMap((prevFieldMap) => ({
        ...prevFieldMap,
        [field]: index,
      }));
    },
    []
  );

  useEffect(() => {
    if (!fieldMap) return onFieldsMapped(undefined);

    if (!Object.keys(FieldList).every((k) => Object.hasOwn(fieldMap, k))) {
      return onFieldsMapped(undefined);
    }

    onFieldsMapped(fieldMap);
  }, [fieldMap]);

  return (
    <div className={styles.fields}>
      {fields.map((field, idx) => (
        <FieldRow field={field} index={idx} onFieldSelect={onFieldSelect} />
      ))}
    </div>
  );
};

export default FieldMapper;

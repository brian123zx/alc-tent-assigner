import React, {
  ChangeEvent,
  useCallback,
  useState,
  useEffect,
  Fragment,
} from "react";
import _ from "lodash";
import styles from "./FieldMapper.module.css";
import { FieldList, FieldMap, MaybeFieldMap } from "../../types";

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
    <div className="grid">
      <h6 className={styles.fieldName}>{field}</h6>
      <div>
        <select onChange={onSelectChanged}>
          <option value="">Select field</option>
          {_.map(FieldList, (field, fieldId) => {
            return (
              <option key={fieldId} value={fieldId}>
                {field}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

type FieldMapperProps = {
  fields: Array<string>;
  onFieldsMapped: (fieldMap: FieldMap | undefined) => void;
};

const FieldMapper = ({ fields, onFieldsMapped }: FieldMapperProps) => {
  const [fieldMap, setFieldMap] = useState<MaybeFieldMap>();
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

    onFieldsMapped(fieldMap as FieldMap);
  }, [fieldMap]);

  return (
    <Fragment>
      Pick the fields from the uploaded spreadsheet to use when processing.
      <div>
        {fields.map((field, idx) => (
          <FieldRow
            key={field}
            field={field}
            index={idx}
            onFieldSelect={onFieldSelect}
          />
        ))}
      </div>
    </Fragment>
  );
};

export default FieldMapper;

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Context.BmRMtLjo.js","_astro/Editor.CrSNzv6p.js","_astro/solid.f9AvF4Qv.js","_astro/Context.BZLk1yC5.js","_astro/Context.-ndUiMgL.js","_astro/Context.BPxC-h9f.js","_astro/Anchor.CTnDMHKR.js","_astro/Merge.BxM7rdZG.js","_astro/Button.DKBOAMH2.js","_astro/Copy.CsKu_x8Q.js","_astro/Copy.D8OFgVAP.css"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './Editor.CrSNzv6p.js';
import { e as editor } from './editor.main.Dxn49_N2.js';
import { createSignal as createSignal$1, mergeProps, untrack, batch, createEffect, onCleanup, createMemo, splitProps, on, onMount, For } from './solid.f9AvF4Qv.js';
import { g as getNextElement, u as use, s as spread, a as runHydrationEvents, t as template } from './web.CXTPjqvK.js';

function createSignal(value) {
    const [get, set] = createSignal$1(value);
    return { get, set };
}

/**
 * Creates and returns the store of the form.
 *
 * @param options The form options.
 *
 * @returns The reactive store.
 */
function createFormStore({ initialValues = {}, validateOn = 'submit', revalidateOn = 'input', validate, } = {}) {
    // Create signals of form store
    const fieldNames = createSignal([]);
    const fieldArrayNames = createSignal([]);
    const element = createSignal();
    const submitCount = createSignal(0);
    const submitting = createSignal(false);
    const submitted = createSignal(false);
    const validating = createSignal(false);
    const touched = createSignal(false);
    const dirty = createSignal(false);
    const invalid = createSignal(false);
    const response = createSignal({});
    // Return form functions and state
    return {
        internal: {
            // Props
            initialValues,
            validate,
            validateOn,
            revalidateOn,
            // Signals
            fieldNames,
            fieldArrayNames,
            element,
            submitCount,
            submitting,
            submitted,
            validating,
            touched,
            dirty,
            invalid,
            response,
            // Stores
            fields: {},
            fieldArrays: {},
            // Other
            validators: new Set(),
        },
        get element() {
            return element.get();
        },
        get submitCount() {
            return submitCount.get();
        },
        get submitting() {
            return submitting.get();
        },
        get submitted() {
            return submitted.get();
        },
        get validating() {
            return validating.get();
        },
        get touched() {
            return touched.get();
        },
        get dirty() {
            return dirty.get();
        },
        get invalid() {
            return invalid.get();
        },
        get response() {
            return response.get();
        },
    };
}

function createForm(options) {
    // Create form store
    const form = createFormStore(options);
    // Return form store and linked components
    return [
        form,
        {
            Form: (props
            // eslint-disable-next-line solid/reactivity
            ) => Form(mergeProps({ of: form }, props)),
            Field: (props) => Field(
            // eslint-disable-next-line solid/reactivity
            mergeProps({ of: form }, props)),
            FieldArray: (props
            // eslint-disable-next-line solid/reactivity
            ) => FieldArray(mergeProps({ of: form }, props)),
        },
    ];
}

/**
 * Returns the current input of the element.
 *
 * @param element The field element.
 * @param field The store of the field.
 * @param type The data type to capture.
 *
 * @returns The element input.
 */
function getElementInput(element, field, type) {
    const { checked, files, options, value, valueAsDate, valueAsNumber } = element;
    return untrack(() => !type || type === 'string'
        ? value
        : type === 'string[]'
            ? options
                ? [...options]
                    .filter((e) => e.selected && !e.disabled)
                    .map((e) => e.value)
                : checked
                    ? [...(field.value.get() || []), value]
                    : (field.value.get() || []).filter((v) => v !== value)
            : type === 'number'
                ? valueAsNumber
                : type === 'boolean'
                    ? checked
                    : type === 'File' && files
                        ? files[0]
                        : type === 'File[]' && files
                            ? [...files]
                            : type === 'Date' && valueAsDate
                                ? valueAsDate
                                : field.value.get());
}

/**
 * Returns a tuple with all field and field array stores of a form.
 *
 * @param form The form of the stores.
 *
 * @returns The store tuple.
 */
function getFieldAndArrayStores(form) {
    return [
        ...Object.values(form.internal.fields),
        ...Object.values(form.internal.fieldArrays),
    ];
}

/**
 * Returns the store of a field array.
 *
 * @param form The form of the field array.
 * @param name The name of the field array.
 *
 * @returns The reactive store.
 */
function getFieldArrayStore(form, name) {
    return form.internal.fieldArrays[name];
}

/**
 * Returns the index of the path in the field array.
 *
 * @param name The name of the field array.
 * @param path The path to get the index from.
 *
 * @returns The field index in the array.
 */
function getPathIndex(name, path) {
    return +path.replace(`${name}.`, '').split('.')[0];
}

/**
 * Removes invalid field or field array names of field arrays.
 *
 * @param form The form of the field array.
 * @param names The names to be filtered.
 */
function removeInvalidNames(form, names) {
    getFieldArrayNames(form, false).forEach((fieldArrayName) => {
        const lastIndex = untrack(getFieldArrayStore(form, fieldArrayName).items.get).length - 1;
        names
            .filter((name) => name.startsWith(`${fieldArrayName}.`) &&
            getPathIndex(fieldArrayName, name) > lastIndex)
            .forEach((name) => {
            names.splice(names.indexOf(name), 1);
        });
    });
}

/**
 * Returns a list with the names of all field arrays.
 *
 * @param form The form of the field arrays.
 * @param shouldValid Whether to be valid.
 *
 * @returns All field array names of the form.
 */
function getFieldArrayNames(form, shouldValid = true) {
    // Get name of every field array
    const fieldArrayNames = [...untrack(form.internal.fieldArrayNames.get)];
    // Remove invalid field array names
    if (shouldValid) {
        removeInvalidNames(form, fieldArrayNames);
    }
    // Return field array names
    return fieldArrayNames;
}

/**
 * Returns a list with the names of all fields.
 *
 * @param form The form of the fields.
 * @param shouldValid Whether to be valid.
 *
 * @returns All field names of the form.
 */
function getFieldNames(form, shouldValid = true) {
    // Get name of every field
    const fieldNames = [...untrack(form.internal.fieldNames.get)];
    // Remove invalid field names
    if (shouldValid) {
        removeInvalidNames(form, fieldNames);
    }
    // Return field names
    return fieldNames;
}

/**
 * Returns the store of a field.
 *
 * @param form The form of the field.
 * @param name The name of the field.
 *
 * @returns The reactive store.
 */
function getFieldStore(form, name) {
    return form.internal.fields[name];
}

/**
 * Returns a tuple with filtered field and field array names. For each
 * specified field array name, the names of the contained fields and field
 * arrays are also returned. If no name is specified, the name of each field
 * and field array of the form is returned.
 *
 * @param form The form of the fields.
 * @param arg2 The name of the fields.
 * @param shouldValid Whether to be valid.
 *
 * @returns A tuple with filtered names.
 */
function getFilteredNames(form, arg2, shouldValid) {
    return untrack(() => {
        // Get all field and field array names of form
        const allFieldNames = getFieldNames(form, shouldValid);
        const allFieldArrayNames = getFieldArrayNames(form, shouldValid);
        // If names are specified, filter and return them
        if (typeof arg2 === 'string' || Array.isArray(arg2)) {
            return (typeof arg2 === 'string' ? [arg2] : arg2)
                .reduce((tuple, name) => {
                // Destructure tuple
                const [fieldNames, fieldArrayNames] = tuple;
                // If it is name of a field array, add it and name of each field
                // and field array it contains to field and field array names
                if (allFieldArrayNames.includes(name)) {
                    allFieldArrayNames.forEach((fieldArrayName) => {
                        if (fieldArrayName.startsWith(name)) {
                            fieldArrayNames.add(fieldArrayName);
                        }
                    });
                    allFieldNames.forEach((fieldName) => {
                        if (fieldName.startsWith(name)) {
                            fieldNames.add(fieldName);
                        }
                    });
                    // If it is name of a field, add it to field name set
                }
                else {
                    fieldNames.add(name);
                }
                // Return tuple
                return tuple;
            }, [new Set(), new Set()])
                .map((set) => [...set]);
        }
        // Otherwise return every field and field array name
        return [allFieldNames, allFieldArrayNames];
    });
}

/**
 * Filters the options object from the arguments and returns it.
 *
 * @param arg1 Maybe the options object.
 * @param arg2 Maybe the options object.
 *
 * @returns The options object.
 */
function getOptions(arg1, arg2) {
    return (typeof arg1 !== 'string' && !Array.isArray(arg1) ? arg1 : arg2) || {};
}

function getPathValue(path, object) {
    return path.split('.').reduce((value, key) => value?.[key], object);
}

// Create counter variable
let counter = 0;
/**
 * Returns a unique ID counting up from zero.
 *
 * @returns A unique ID.
 */
function getUniqueId() {
    return counter++;
}

/**
 * Returns whether the field is dirty.
 *
 * @param startValue The start value.
 * @param currentValue The current value.
 *
 * @returns Whether is dirty.
 */
function isFieldDirty(startValue, currentValue) {
    const toValue = (item) => item instanceof Blob ? item.size : item;
    return Array.isArray(startValue) && Array.isArray(currentValue)
        ? startValue.map(toValue).join() !== currentValue.map(toValue).join()
        : startValue instanceof Date && currentValue instanceof Date
            ? startValue.getTime() !== currentValue.getTime()
            : Number.isNaN(startValue) && Number.isNaN(currentValue)
                ? false
                : startValue !== currentValue;
}

/**
 * Updates the dirty state of the form.
 *
 * @param form The store of the form.
 * @param dirty Whether dirty state is true.
 */
function updateFormDirty(form, dirty) {
    untrack(() => form.internal.dirty.set(dirty ||
        getFieldAndArrayStores(form).some((fieldOrFieldArray) => fieldOrFieldArray.active.get() && fieldOrFieldArray.dirty.get())));
}

/**
 * Updates the dirty state of a field.
 *
 * @param form The form of the field.
 * @param field The store of the field.
 */
function updateFieldDirty(form, field) {
    untrack(() => {
        // Check if field is dirty
        const dirty = isFieldDirty(field.startValue.get(), field.value.get());
        // Update dirty state of field if necessary
        if (dirty !== field.dirty.get()) {
            batch(() => {
                field.dirty.set(dirty);
                // Update dirty state of form
                updateFormDirty(form, dirty);
            });
        }
    });
}

/**
 * Validates a field or field array only if required.
 *
 * @param form The form of the field or field array.
 * @param fieldOrFieldArray The store of the field or field array.
 * @param name The name of the field or field array.
 * @param options The validate options.
 */
function validateIfRequired(form, fieldOrFieldArray, name, { on: modes, shouldFocus = false }) {
    untrack(() => {
        if (modes.includes((form.internal.validateOn === 'submit'
            ? form.internal.submitted.get()
            : fieldOrFieldArray.error.get())
            ? form.internal.revalidateOn
            : form.internal.validateOn)) {
            validate(form, name, { shouldFocus });
        }
    });
}

function handleFieldEvent(form, field, name, event, validationModes, inputValue) {
    batch(() => {
        // Update value state
        field.value.set((prevValue) => field.transform.reduce((current, transformation) => transformation(current, event), inputValue ?? prevValue));
        // Update touched state
        field.touched.set(true);
        form.internal.touched.set(true);
        // Update dirty state
        updateFieldDirty(form, field);
        // Validate value if required
        validateIfRequired(form, field, name, { on: validationModes });
    });
}

/**
 * Initializes and returns the store of a field array.
 *
 * @param form The form of the field array.
 * @param name The name of the field array.
 *
 * @returns The reactive store.
 */
function initializeFieldArrayStore(form, name) {
    // Initialize store on first request
    if (!getFieldArrayStore(form, name)) {
        // Create initial items of field array
        const initial = getPathValue(name, form.internal.initialValues)?.map(() => getUniqueId()) || [];
        // Create signals of field array store
        const initialItems = createSignal(initial);
        const startItems = createSignal(initial);
        const items = createSignal(initial);
        const error = createSignal('');
        const active = createSignal(false);
        const touched = createSignal(false);
        const dirty = createSignal(false);
        // Add store of field array to form
        form.internal.fieldArrays[name] = {
            // Signals
            initialItems,
            startItems,
            items,
            error,
            active,
            touched,
            dirty,
            // Other
            validate: [],
            consumers: new Set(),
        };
        // Add name of field array to form
        form.internal.fieldArrayNames.set((names) => [...names, name]);
    }
    // Return store of field array
    return getFieldArrayStore(form, name);
}

function initializeFieldStore(form, name) {
    // Initialize store on first request
    if (!getFieldStore(form, name)) {
        // Get initial value of field
        const initial = getPathValue(name, form.internal.initialValues);
        // Create signals of field store
        const elements = createSignal([]);
        const initialValue = createSignal(initial);
        const startValue = createSignal(initial);
        const value = createSignal(initial);
        const error = createSignal('');
        const active = createSignal(false);
        const touched = createSignal(false);
        const dirty = createSignal(false);
        // Add store of field to form
        // @ts-expect-error
        form.internal.fields[name] = {
            // Signals
            elements,
            initialValue,
            startValue,
            value,
            error,
            active,
            touched,
            dirty,
            // Other
            validate: [],
            transform: [],
            consumers: new Set(),
        };
        // Add name of field to form
        form.internal.fieldNames.set((names) => [...names, name]);
    }
    // Return store of field
    return getFieldStore(form, name);
}

/**
 * Sets an error response if a form error was not set at any field or field
 * array.
 *
 * @param form The form of the errors.
 * @param formErrors The form errors.
 * @param options The error options.
 */
function setErrorResponse(form, formErrors, { shouldActive = true }) {
    // Combine errors that were not set for any field or field array into one
    // general form error response message
    const message = Object.entries(formErrors)
        .reduce((errors, [name, error]) => {
        if ([
            getFieldStore(form, name),
            getFieldArrayStore(form, name),
        ].every((fieldOrFieldArray) => !fieldOrFieldArray ||
            (shouldActive && !untrack(fieldOrFieldArray.active.get)))) {
            errors.push(error);
        }
        return errors;
    }, [])
        .join(' ');
    // If there is a error message, set it as form response
    if (message) {
        form.internal.response.set({
            status: 'error',
            message,
        });
    }
}

/**
 * Updates the invalid state of the form.
 *
 * @param form The store of the form.
 * @param dirty Whether there is an error.
 */
function updateFormInvalid(form, invalid) {
    untrack(() => {
        form.internal.invalid.set(invalid ||
            getFieldAndArrayStores(form).some((fieldOrFieldArray) => fieldOrFieldArray.active.get() && fieldOrFieldArray.error.get()));
    });
}

/**
 * Updates the touched, dirty and invalid state of the form.
 *
 * @param form The store of the form.
 */
function updateFormState(form) {
    // Create state variables
    let touched = false, dirty = false, invalid = false;
    // Check each field and field array and update state if necessary
    untrack(() => {
        for (const fieldOrFieldArray of getFieldAndArrayStores(form)) {
            if (fieldOrFieldArray.active.get()) {
                if (fieldOrFieldArray.touched.get()) {
                    touched = true;
                }
                if (fieldOrFieldArray.dirty.get()) {
                    dirty = true;
                }
                if (fieldOrFieldArray.error.get()) {
                    invalid = true;
                }
            }
            // Break loop if all state values are "true"
            if (touched && dirty && invalid) {
                break;
            }
        }
    });
    // Update state of form
    batch(() => {
        form.internal.touched.set(touched);
        form.internal.dirty.set(dirty);
        form.internal.invalid.set(invalid);
    });
}

/**
 * Focuses the specified field of the form.
 *
 * @param form The form of the field.
 * @param name The name of the field.
 */
function focus(form, name) {
    untrack(() => getFieldStore(form, name)?.elements.get()[0]?.focus());
}

/**
 * Sets the error of the specified field or field array.
 *
 * @param form The form of the field.
 * @param name The name of the field.
 * @param error The error message.
 * @param options The error options.
 */
function setError(form, name, error, { shouldActive = true, shouldTouched = false, shouldDirty = false, shouldFocus = !!error, } = {}) {
    batch(() => {
        untrack(() => {
            for (const fieldOrFieldArray of [
                getFieldStore(form, name),
                getFieldArrayStore(form, name),
            ]) {
                if (fieldOrFieldArray &&
                    (!shouldActive || fieldOrFieldArray.active.get()) &&
                    (!shouldTouched || fieldOrFieldArray.touched.get()) &&
                    (!shouldDirty || fieldOrFieldArray.dirty.get())) {
                    // Set error to field or field array
                    fieldOrFieldArray.error.set(error);
                    // Focus element if set to "true"
                    if (error && 'value' in fieldOrFieldArray && shouldFocus) {
                        focus(form, name);
                    }
                }
            }
        });
        // Update invalid state of form
        updateFormInvalid(form, !!error);
    });
}

/**
 * Clears the error of the specified field or field array.
 *
 * @param form The form of the field.
 * @param name The name of the field.
 * @param options The error options.
 */
function clearError(form, name, options) {
    setError(form, name, '', options);
}

function getValues(form, arg2, arg3) {
    // Get filtered field names to get value from
    const [fieldNames, fieldArrayNames] = getFilteredNames(form, arg2);
    // Destructure options and set default values
    const { shouldActive = true, shouldTouched = false, shouldDirty = false, shouldValid = false, } = getOptions(arg2, arg3);
    // If no field or field array name is specified, set listener to be notified
    // when a new field is added
    if (typeof arg2 !== 'string' && !Array.isArray(arg2)) {
        form.internal.fieldNames.get();
        // Otherwise if a field array is included, set listener to be notified when
        // a new field array items is added
    }
    else {
        fieldArrayNames.forEach((fieldArrayName) => getFieldArrayStore(form, fieldArrayName).items.get());
    }
    // Create and return values of form or field array
    return fieldNames.reduce((values, name) => {
        // Get store of specified field
        const field = getFieldStore(form, name);
        // Add value if field corresponds to filter options
        if ((!shouldActive || field.active.get()) &&
            (!shouldTouched || field.touched.get()) &&
            (!shouldDirty || field.dirty.get()) &&
            (!shouldValid || !field.error.get())) {
            // Split name into keys to be able to add values of nested fields
            (typeof arg2 === 'string' ? name.replace(`${arg2}.`, '') : name)
                .split('.')
                .reduce((object, key, index, keys) => (object[key] =
                index === keys.length - 1
                    ? // If it is last key, add value
                        field.value.get()
                    : // Otherwise return object or array
                        (typeof object[key] === 'object' && object[key]) ||
                            (isNaN(+keys[index + 1]) ? {} : [])), values);
        }
        // Return modified values object
        return values;
    }, typeof arg2 === 'string' ? [] : {});
}

function reset(form, arg2, arg3) {
    // Filter names between field and field arrays
    const [fieldNames, fieldArrayNames] = getFilteredNames(form, arg2, false);
    // Check if only a single field should be reset
    const resetSingleField = typeof arg2 === 'string' && fieldNames.length === 1;
    // Check if entire form should be reset
    const resetEntireForm = !resetSingleField && !Array.isArray(arg2);
    // Get options object
    const options = getOptions(arg2, arg3);
    // Destructure options and set default values
    const { initialValue, initialValues, keepResponse = false, keepSubmitCount = false, keepSubmitted = false, keepValues = false, keepDirtyValues = false, keepItems = false, keepDirtyItems = false, keepErrors = false, keepTouched = false, keepDirty = false, } = options;
    batch(() => untrack(() => {
        // Reset state of each field
        fieldNames.forEach((name) => {
            // Get store of specified field
            const field = getFieldStore(form, name);
            // Reset initial value if necessary
            if (resetSingleField ? 'initialValue' in options : initialValues) {
                field.initialValue.set(() => resetSingleField ? initialValue : getPathValue(name, initialValues));
            }
            // Check if dirty value should be kept
            const keepDirtyValue = keepDirtyValues && field.dirty.get();
            // Reset input if it is not to be kept
            if (!keepValues && !keepDirtyValue) {
                field.startValue.set(field.initialValue.get);
                field.value.set(field.initialValue.get);
                // Reset file inputs manually, as they can't be controlled
                field.elements.get().forEach((element) => {
                    if (element.type === 'file') {
                        element.value = '';
                    }
                });
            }
            // Reset touched if it is not to be kept
            if (!keepTouched) {
                field.touched.set(false);
            }
            // Reset dirty if it is not to be kept
            if (!keepDirty && !keepValues && !keepDirtyValue) {
                field.dirty.set(false);
            }
            // Reset error if it is not to be kept
            if (!keepErrors) {
                field.error.set('');
            }
        });
        // Reset state of each field array
        fieldArrayNames.forEach((name) => {
            // Get store of specified field array
            const fieldArray = getFieldArrayStore(form, name);
            // Check if current dirty items should be kept
            const keepCurrentDirtyItems = keepDirtyItems && fieldArray.dirty.get();
            // Reset initial items and items if it is not to be kept
            if (!keepItems && !keepCurrentDirtyItems) {
                if (initialValues) {
                    fieldArray.initialItems.set(getPathValue(name, initialValues)?.map(() => getUniqueId()) || []);
                }
                fieldArray.startItems.set([...fieldArray.initialItems.get()]);
                fieldArray.items.set([...fieldArray.initialItems.get()]);
            }
            // Reset touched if it is not to be kept
            if (!keepTouched) {
                fieldArray.touched.set(false);
            }
            // Reset dirty if it is not to be kept
            if (!keepDirty && !keepItems && !keepCurrentDirtyItems) {
                fieldArray.dirty.set(false);
            }
            // Reset error if it is not to be kept
            if (!keepErrors) {
                fieldArray.error.set('');
            }
        });
        // Reset state of form if necessary
        if (resetEntireForm) {
            // Reset response if it is not to be kept
            if (!keepResponse) {
                form.internal.response.set({});
            }
            // Reset submit count if it is not to be kept
            if (!keepSubmitCount) {
                form.internal.submitCount.set(0);
            }
            // Reset submitted if it is not to be kept
            if (!keepSubmitted) {
                form.internal.submitted.set(false);
            }
        }
        // Update touched, dirty and invalid state of form
        updateFormState(form);
    }));
}

/**
 * Sets the response of the form.
 *
 * @param form The form of the response.
 * @param response The response object.
 * @param options The response options.
 */
function setResponse(form, response, { duration } = {}) {
    // Set new response
    form.internal.response.set(response);
    // If necessary, remove new response after specified duration if response has
    // not been changed in meantime
    if (duration) {
        setTimeout(() => {
            if (untrack(form.internal.response.get) === response) {
                form.internal.response.set({});
            }
        }, duration);
    }
}

function setValue(form, name, value, { shouldTouched = true, shouldDirty = true, shouldValidate = true, shouldFocus = true, } = {}) {
    batch(() => {
        // Initialize store of specified field
        const field = initializeFieldStore(form, name);
        // Set new value
        field.value.set(() => value);
        // Update touched if set to "true"
        if (shouldTouched) {
            field.touched.set(true);
            form.internal.touched.set(true);
        }
        // Update dirty if set to "true"
        if (shouldDirty) {
            updateFieldDirty(form, field);
        }
        // Validate if set to "true" and necessary
        if (shouldValidate) {
            validateIfRequired(form, field, name, {
                on: ['touched', 'input'],
                shouldFocus,
            });
        }
    });
}

async function validate(form, arg2, arg3) {
    // Filter names between field and field arrays
    const [fieldNames, fieldArrayNames] = getFilteredNames(form, arg2);
    // Destructure options and set default values
    const { shouldActive = true, shouldFocus = true } = getOptions(arg2, arg3);
    // Create unique validator ID and add it to list
    const validator = getUniqueId();
    form.internal.validators.add(validator);
    // Set validating to "true"
    form.internal.validating.set(true);
    // Run form validation function
    const formErrors = form.internal.validate
        ? await form.internal.validate(untrack(() => getValues(form, { shouldActive })))
        : {};
    // Create valid variable
    let valid = typeof arg2 !== 'string' && !Array.isArray(arg2)
        ? !Object.keys(formErrors).length
        : true;
    const [errorFields] = await Promise.all([
        // Validate each field in list
        Promise.all(fieldNames.map(async (name) => {
            // Get store of specified field
            const field = getFieldStore(form, name);
            // Continue if field corresponds to filter options
            if (!shouldActive || untrack(field.active.get)) {
                // Create local error variable
                let localError;
                // Run each field validation functions
                for (const validation of field.validate) {
                    localError = await validation(untrack(field.value.get));
                    // Break loop if an error occurred
                    if (localError) {
                        break;
                    }
                }
                // Create field error from local and global error
                const fieldError = localError || formErrors[name] || '';
                // Set valid to "false" if an error occurred
                if (fieldError) {
                    valid = false;
                }
                // Update error state of field
                field.error.set(fieldError);
                // Return name if field has an error
                return fieldError ? name : null;
            }
        })),
        // Validate each field array in list
        Promise.all(fieldArrayNames.map(async (name) => {
            // Get store of specified field array
            const fieldArray = getFieldArrayStore(form, name);
            // Continue if field array corresponds to filter options
            if (!shouldActive || untrack(fieldArray.active.get)) {
                // Create local error variable
                let localError = '';
                // Run each field array validation functions
                for (const validation of fieldArray.validate) {
                    localError = await validation(untrack(fieldArray.items.get));
                    // Break loop and if an error occurred
                    if (localError) {
                        break;
                    }
                }
                // Create field array error from local and global error
                const fieldArrayError = localError || formErrors[name] || '';
                // Set valid to "false" if an error occurred
                if (fieldArrayError) {
                    valid = false;
                }
                // Update error state of field
                fieldArray.error.set(fieldArrayError);
            }
        })),
    ]);
    batch(() => {
        // Set error response if necessary
        setErrorResponse(form, formErrors, { shouldActive });
        // Focus first field with an error if specified
        if (shouldFocus) {
            const name = errorFields.find((name) => name);
            if (name) {
                focus(form, name);
            }
        }
        // Update invalid state of form
        updateFormInvalid(form, !valid);
        // Delete validator from list
        form.internal.validators.delete(validator);
        // Set validating to "false" if there is no other validator
        if (!form.internal.validators.size) {
            form.internal.validating.set(false);
        }
    });
    // Return whether fields are valid
    return valid;
}

function createLifecycle({ of: form, name, getStore, validate, transform, keepActive = false, keepState = true, }) {
    createEffect(() => {
        // Get store of field or field array
        const store = getStore();
        // Add validation functions
        store.validate = validate
            ? Array.isArray(validate)
                ? validate
                : [validate]
            : [];
        // Add transformation functions
        if ('transform' in store) {
            store.transform = transform
                ? Array.isArray(transform)
                    ? transform
                    : [transform]
                : [];
        }
        // Create unique consumer ID
        const consumer = getUniqueId();
        // Add consumer to field
        store.consumers.add(consumer);
        // Mark field as active and update form state if necessary
        if (!untrack(store.active.get)) {
            batch(() => {
                store.active.set(true);
                updateFormState(form);
            });
        }
        // On cleanup, remove consumer from field
        onCleanup(() => setTimeout(() => {
            store.consumers.delete(consumer);
            // Mark field as inactive if there is no other consumer
            batch(() => {
                if (!keepActive && !store.consumers.size) {
                    store.active.set(false);
                    // Reset state if it is not to be kept
                    if (!keepState) {
                        reset(form, name);
                        // Otherwise just update form state
                    }
                    else {
                        updateFormState(form);
                    }
                }
            });
            // Remove unmounted elements
            if ('elements' in store) {
                store.elements.set((elements) => elements.filter((element) => element.isConnected));
            }
        }));
    });
}

function Field(props) {
  const getField = createMemo(() => initializeFieldStore(props.of, props.name));
  createLifecycle(mergeProps({
    getStore: getField
  }, props));
  return createMemo(() => props.children({
    get name() {
      return props.name;
    },
    get value() {
      return getField().value.get();
    },
    get error() {
      return getField().error.get();
    },
    get active() {
      return getField().active.get();
    },
    get touched() {
      return getField().touched.get();
    },
    get dirty() {
      return getField().dirty.get();
    }
  }, {
    get name() {
      return props.name;
    },
    get autofocus() {
      return !!getField().error.get();
    },
    ref(element) {
      getField().elements.set((elements) => [...elements, element]);
      createEffect(() => {
        if (element.type !== "radio" && getField().startValue.get() === void 0 && untrack(getField().value.get) === void 0) {
          const input = getElementInput(element, getField(), props.type);
          getField().startValue.set(() => input);
          getField().value.set(() => input);
        }
      });
    },
    onInput(event) {
      handleFieldEvent(props.of, getField(), props.name, event, ["touched", "input"], getElementInput(event.currentTarget, getField(), props.type));
    },
    onChange(event) {
      handleFieldEvent(props.of, getField(), props.name, event, ["change"]);
    },
    onBlur(event) {
      handleFieldEvent(props.of, getField(), props.name, event, ["touched", "blur"]);
    }
  }));
}

function FieldArray(props) {
  const getFieldArray = createMemo(() => initializeFieldArrayStore(props.of, props.name));
  createLifecycle(mergeProps({
    getStore: getFieldArray
  }, props));
  return createMemo(() => props.children({
    get name() {
      return props.name;
    },
    get items() {
      return getFieldArray().items.get();
    },
    get error() {
      return getFieldArray().error.get();
    },
    get active() {
      return getFieldArray().active.get();
    },
    get touched() {
      return getFieldArray().touched.get();
    },
    get dirty() {
      return getFieldArray().dirty.get();
    }
  }));
}

/**
 * An explicit form error with useful information for the user.
 */
class FormError extends Error {
    name = 'FormError';
    errors;
    constructor(arg1, arg2) {
        super(typeof arg1 === 'string' ? arg1 : '');
        this.errors = typeof arg1 === 'string' ? arg2 || {} : arg1;
    }
}

var _tmpl$ = /* @__PURE__ */ template(`<form novalidate>`);
function Form(props) {
  const [, options, other] = splitProps(props, ["of"], ["keepResponse", "shouldActive", "shouldTouched", "shouldDirty", "shouldFocus"]);
  return (() => {
    var _el$ = getNextElement(_tmpl$);
    var _ref$ = props.of.internal.element.set;
    typeof _ref$ === "function" ? use(_ref$, _el$) : props.of.internal.element.set = _el$;
    spread(_el$, mergeProps(other, {
      "onSubmit": async (event) => {
        event.preventDefault();
        const {
          of: form,
          onSubmit,
          responseDuration: duration
        } = props;
        batch(() => {
          if (!options.keepResponse) {
            form.internal.response.set({});
          }
          form.internal.submitCount.set((count) => count + 1);
          form.internal.submitted.set(true);
          form.internal.submitting.set(true);
        });
        try {
          if (await validate(form, options)) {
            await onSubmit(getValues(form, options), event);
          }
        } catch (error) {
          batch(() => {
            if (error instanceof FormError) {
              Object.entries(error.errors).forEach(([name, error2]) => {
                if (error2) {
                  setError(form, name, error2, {
                    ...options,
                    shouldFocus: false
                  });
                }
              });
            }
            if (!(error instanceof FormError) || error.message) {
              setResponse(form, {
                status: "error",
                message: error?.message || "An unknown error has occurred."
              }, {
                duration
              });
            }
          });
        } finally {
          form.internal.submitting.set(false);
        }
      }
    }), false);
    runHydrationEvents();
    return _el$;
  })();
}

/**
 * Creates a validation function that checks the existence of an input.
 *
 * @param error The error message.
 *
 * @returns A validation function.
 */
function required(error) {
    return (value) => (!value && value !== 0) || (Array.isArray(value) && !value.length)
        ? error
        : '';
}

var A=({Type:r}={Type:"HTML"})=>{const[n,{Form:d,Field:f}]=createForm(),i=crypto.randomUUID();createEffect(on(o.Editors[0],e=>{setValue(n,"Content",e.get(i)?.Content??"",{shouldFocus:!1,shouldTouched:!1}),validate(n);},{defer:!1}));const s=createSignal$1(w(r));createEffect(on(c.Messages[0],e=>e?.get("Type")&&s[1](e?.get("Type")),{defer:!1}));let u,t;return o.Editors[0]().set(i,{Type:r,Hidden:o.Editors[0]().size>0,Content:s[0]()}),onMount(()=>{u instanceof HTMLElement&&(t=editor.create(u,{value:s[0](),language:r.toLowerCase(),automaticLayout:!0,lineNumbers:"off","semanticHighlighting.enabled":"configuredByTheme",autoClosingBrackets:"always",autoIndent:"full",tabSize:4,detectIndentation:!1,useTabStops:!0,minimap:{enabled:!1},scrollbar:{useShadows:!0,horizontal:"hidden",verticalScrollbarSize:10,verticalSliderSize:4,alwaysConsumeMouseWheel:!1},folding:!1,theme:window.matchMedia("(prefers-color-scheme: dark)").matches?"Dark":"Light",wrappingStrategy:"advanced",word:"on",bracketPairColorization:{enabled:!0,independentColorPoolPerBracketType:!0},padding:{top:12,bottom:12},fixedOverflowWidgets:!0,tabCompletion:"on",acceptSuggestionOnEnter:"on",cursorWidth:5,roundedSelection:!0,matchBrackets:"always",autoSurround:"languageDefined",screenReaderAnnounceInlineSuggestion:!1,renderFinalNewline:"on",selectOnLineNumbers:!1,formatOnType:!0,formatOnPaste:!0,fontFamily:"'Source Code Pro'",fontWeight:"400",fontLigatures:!0,links:!1,fontSize:16}),t.getModel()?.setEOL(editor.EndOfLineSequence.LF),t.onKeyDown(e=>{e.ctrlKey&&e.code==="KeyS"&&(e.preventDefault(),validate(n),n.element?.submit());}),t.getModel()?.onDidChangeContent(()=>{o.Editors[1](S(o.Editors[0](),new Map([[i,{Content:t.getModel()?.getValue()??"",Hidden:o.Editors[0]()?.get(i)?.Hidden??!0,Type:r}]])));}),t.onDidChangeModelLanguageConfiguration(()=>t.getAction("editor.action.formatDocument")?.run()),t.onDidLayoutChange(()=>t.getAction("editor.action.formatDocument")?.run()),window.addEventListener("load",()=>t.getAction("editor.action.formatDocument")?.run()),setTimeout(()=>t.getAction("editor.action.formatDocument")?.run(),1e3),createEffect(on(s[0],e=>t.getModel()?.setValue(e),{defer:!1})),c.Socket[0]()?.send(JSON.stringify({Key:l.Items[0]()?.get("Key")?.[0](),Identifier:l.Items[0]()?.get("Identifier")?.[0](),From:"Content",View:r})));}),h("div",{class:!o.Editors[0]()?.get(i)?.Hidden&&T.Data[0]()?.get("Name")?"":"hidden"},h("p",null,"Edit your"," ",h(For,{each:Array.from(o.Editors[0]().entries())},(e,a)=>h(Fragment,null,h(M,{Action:()=>{o.Editors[0]().forEach((g,y)=>{g.Hidden=e[0]!==y,o.Editors[1](S(o.Editors[0](),new Map([[y,g]])));}),setTimeout(()=>{t.setScrollPosition({scrollTop:-50});},1e3);}},e[1].Type),a()===o.Editors[0]().size-1?"":" / "))," ","here:"),h("br",null),h(d,{method:"post",onSubmit:b},h(f,{name:"Content",validate:[required(`Please enter some ${r}.`)]},(e,a)=>h("div",{class:"w-full"},h("div",{class:"Editor"},h("code",{ref:u,class:"Monaco"}),e.error&&h(Fragment,null,h("div",{class:"Error",onClick:()=>{clearError(n,"Content"),t.focus();}},h("span",null,"\xA0\xA0\xA0",e.error))),h("input",{...a,value:o.Editors[0]()?.get(i)?.Content??"",type:"hidden",required:!0})))),h(f,{name:"Field"},(e,a)=>h("input",{type:"hidden",...a,value:r}))))};const w=r=>{switch(r){case"CSS":return `
/* Example CSS Code */
body {

}			
`;case"HTML":return `
<!-- Example HTML Code -->
<!doctype html>
<html lang="en">
	<body>
	</body>
</html>
`;case"TypeScript":return `
/**
 * Example TypeScript Code
 */
export default () => ({});
`;default:return ""}},b=({Content:r,Field:n},d)=>{d&&(d.preventDefault(),c.Socket[0]()?.send(JSON.stringify({Key:l.Items[0]()?.get("Key")?.[0](),Identifier:l.Items[0]()?.get("Identifier")?.[0](),To:n,Input:r})));},{default:o}=await __vitePreload(async () => { const {default:o} = await import('./Context.BmRMtLjo.js');return {default:o}},true?__vite__mapDeps([0,1,2]):void 0),{default:c}=await __vitePreload(async () => { const {default:c} = await import('./Context.BZLk1yC5.js');return {default:c}},true?__vite__mapDeps([3,1,2]):void 0),{default:T}=await __vitePreload(async () => { const {default:T} = await import('./Context.-ndUiMgL.js');return {default:T}},true?__vite__mapDeps([4,1,2]):void 0),{default:l}=await __vitePreload(async () => { const {default:l} = await import('./Context.BPxC-h9f.js');return {default:l}},true?__vite__mapDeps([5,1,2]):void 0),{default:M}=await __vitePreload(async () => { const {default:M} = await import('./Anchor.CTnDMHKR.js');return {default:M}},true?__vite__mapDeps([6,7,1,2]):void 0),{default:k}=await __vitePreload(async () => { const {default:k} = await import('./Button.DKBOAMH2.js');return {default:k}},true?__vite__mapDeps([8,1,2]):void 0),{default:O,Fn:z}=await __vitePreload(async () => { const {default:O,Fn:z} = await import('./Copy.CsKu_x8Q.js');return {default:O,Fn:z}},true?__vite__mapDeps([9,1,2,10]):void 0),{default:S}=await __vitePreload(async () => { const {default:S} = await import('./Merge.BxM7rdZG.js');return {default:S}},true?__vite__mapDeps([7,1,2]):void 0);

export { o as Action, M as Anchor, k as Button, c as Connection, z as Copy, S as Merge, w as Return, T as Session, l as Store, O as Tip, b as Update, A as default };
//# sourceMappingURL=Editor.gL_Lz7uS.js.map

#include <Python.h>

// Original append function pointer
static PyObject *(*original_append)(PyObject *, PyObject *);

// New append method
static PyObject *custom_append(PyObject *self, PyObject *arg) {
    PyObject *new_arg = PyUnicode_FromFormat("~~~~%S~~~~", arg);
    if (new_arg == NULL) return NULL; // Handle error in argument creation

    // Call the original append method with the new argument
    PyObject *result = original_append(self, new_arg);
    Py_DECREF(new_arg); // Clean up the reference
    return result;
}

// Function to replace the append method of the list type
static PyObject *install_custom_append(PyObject *module) {
    // Find the 'append' method in the list of methods for the list type
    PyMethodDef *methods = PyList_Type.tp_methods;
    for (; methods->ml_name != NULL; methods++) {
        if (strcmp(methods->ml_name, "append") == 0) {
            original_append = (PyObject *(*)(PyObject *, PyObject *))methods->ml_meth;
            methods->ml_meth = (PyCFunction)custom_append;
            break;
        }
    }
    Py_RETURN_NONE;
}

// Module method definitions
static PyMethodDef module_methods[] = {
    {"install_custom_append", install_custom_append, METH_NOARGS, "Patches the list append method."},
    {NULL, NULL, 0, NULL}
};

// Module definition
static struct PyModuleDef customlistmodule = {
    PyModuleDef_HEAD_INIT,
    "customlist",
    "Module to override list append method.",
    -1,
    module_methods
};

// Initialize the module
PyMODINIT_FUNC PyInit_customlist(void) {
    return PyModule_Create(&customlistmodule);
}

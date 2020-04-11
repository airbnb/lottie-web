import json
from os.path import join
from glob import glob

folder = "./docs/json"

schemas = {}

known_error = [
    # "#/effects/layerIndex",
    "#/shapes/roundedCorners",
    # "#/layers/comp",
    "#/properties/const",
    "#/properties/constKeyframed",
    # "#/helpers/textBased",
]


def check_add(t):
    if t.startswith("#") and t not in schemas and t not in known_error:
        check(t)


def find_refs(node):
    # print(node)
    if isinstance(node, dict):
        for key in node:
            if key == "$ref":
                check_add(node[key])
            else:
                find_refs(node[key])

    elif isinstance(node, list):
        for v in node:
            find_refs(v)


def check(type):
    print(f"process {type}")

    path = type.replace("#", folder) + ".json"

    with open(path) as ifile:
        icontent = json.load(ifile)

        schemas[type] = icontent

        find_refs(icontent)


def check_not_ref_types():
    for p in glob(f"{folder}/**/*.json"):
        p = "#/" + p.split("json/")[1].replace(".json", "")
        if p not in schemas:
            print(f"not passed {p}")


check("#/animation")
check_not_ref_types()

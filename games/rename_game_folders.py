from pathlib import Path
import argparse
import os


ROOT = Path(__file__).resolve().parent
INDEX_FILE = ROOT / "index.html"

# Old folder aliases -> new English URL-safe folder name.
RENAMES = [
    (("GeoSwitching", "Спліт"), "Split"),
    (("Stroop", "Кольоровий світлофор"), "ColorTrafficLight"),
    (("Airport", "Вектор"), "Vector"),
    (("ClickerBlackRed", "Дуал - контроль"), "DualControl"),
    (("Concentration", "Дзеркальні пари"), "MirrorPairs"),
    (("Stroop2", "Візуальний захват"), "VisualCapture"),
    (("RockMemory", "Фокус-Покус"), "FocusPocus"),
    (("Diamonds", "Грані Пам'яті"), "FacetsOfMemory"),
    (("FindDifferences", "Селективний пошук"), "SelectiveSearch"),
    (("FlangerTask", "Траєкторія"), "Trajectory"),
    (("QSort", "Класифікатор"), "Classifier"),
    (("QSortEx", "Логічний фільтр"), "LogicFilter"),
    (("Steps", "Бонобо"), "Bonobo"),
]


def assert_inside_root(path):
    path.resolve().relative_to(ROOT)


def validate_targets():
    errors = []

    for source_names, new_name in RENAMES:
        new_path = ROOT / new_name
        source_paths = [ROOT / source_name for source_name in source_names]

        assert_inside_root(new_path)
        for source_path in source_paths:
            assert_inside_root(source_path)

        existing_sources = [path for path in source_paths if path.exists()]
        if existing_sources and new_path.exists():
            aliases = ", ".join(source_names)
            errors.append(f"Both source and target exist: {aliases} -> {new_name}")
        elif not existing_sources and not new_path.exists():
            aliases = ", ".join(source_names)
            errors.append(f"Missing source folder: {aliases}")
        elif any(path.exists() and not path.is_dir() for path in source_paths):
            aliases = ", ".join(source_names)
            errors.append(f"Source is not a folder: {aliases}")
        elif new_path.exists() and not new_path.is_dir():
            errors.append(f"Target exists but is not a folder: {new_name}")

    if errors:
        raise RuntimeError("\n".join(errors))


def rename_folders(dry_run):
    for source_names, new_name in RENAMES:
        new_path = ROOT / new_name

        if new_path.exists():
            print(f"skip: {new_name} already exists")
            continue

        old_name = next(source_name for source_name in source_names if (ROOT / source_name).exists())
        old_path = ROOT / old_name

        print(f"rename: {old_name} -> {new_name}")
        if not dry_run:
            os.replace(old_path, new_path)


def update_index_links(dry_run):
    if not INDEX_FILE.exists():
        print("skip: index.html not found")
        return

    text = INDEX_FILE.read_text(encoding="utf-8")
    updated = text

    for source_names, new_name in RENAMES:
        for source_name in source_names:
            updated = updated.replace(f"./{source_name}/index.html", f"./{new_name}/index.html")

    if updated == text:
        print("skip: index.html links already updated")
        return

    print("update: index.html links")
    if not dry_run:
        INDEX_FILE.write_text(updated, encoding="utf-8", newline="")


def main():
    parser = argparse.ArgumentParser(description="Rename game folders and update links.")
    parser.add_argument("--dry-run", action="store_true", help="Show planned changes without writing.")
    args = parser.parse_args()

    validate_targets()
    rename_folders(args.dry_run)
    update_index_links(args.dry_run)

    if args.dry_run:
        print("dry-run complete")
    else:
        print("done")


if __name__ == "__main__":
    main()

/**
 * @module FileSystem/Type/FileType
 * @description
 * File type enumeration for distinguishing between files, directories, and symbolic links.
 * Corresponds to VSCode's FileType enum.
 * @category Type
 */
/**
 * File type enum matching VSCode's FileType
 */
export declare enum FileType {
    /** Unknown file type */
    Unknown = 0,
    /** Regular file */
    File = 1,
    /** Directory */
    Directory = 2,
    /** Symbolic link (or other special file) */
    SymbolicLink = 64
}
/**
 * Convert FileType enum to readable string
 */
export declare function fileTypeToString(fileType: FileType): string;
//# sourceMappingURL=FileType.d.ts.map
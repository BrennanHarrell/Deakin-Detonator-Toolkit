import { Button, LoadingOverlay, Stack, TextInput, Title, Checkbox, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Foremost Tool";
const description_userguide =
    "Foremost is a console program to recover files based on their headers, footers, and internal data structures. " +
    "This process is commonly referred to as data carving. Foremost can work on image files, such as those generated " +
    "by dd, Safeback, Encase, etc, or directly on a drive. The headers and footers can be specified by a configuration " +
    "file or you can use command line switches to specify built-in file types. These built-in types look at the data " +
    "structures of a given file format allowing for a more reliable and faster recovery.";

// Define the form values with their types
interface FormValuesType {
    input: string;
    outputDir: string;
    config: string;
    quiet: boolean;
    verbose: boolean;
    types: string;
    indirectBlockDetection: boolean;
    allHeaders: boolean;
    auditFileOnly: boolean;
    quickMode: boolean;
}

const ForemostTool = () => {
    // State hooks for loading, output, and advanced mode switch
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);

    // Create a form using Mantine's useForm hook
    let form = useForm<FormValuesType>({
        initialValues: {
            input: "",
            outputDir: "",
            config: "",
            quiet: false,
            verbose: false,
            types: "",
            indirectBlockDetection: false,
            allHeaders: false,
            auditFileOnly: false,
            quickMode: false,
        },
    });

    // Handle form submission
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        // Initialize the command arguments with the input and output options
        const args = [`-i`, `${values.input}`, `-o`, `${values.outputDir}`];

        // Add optional flags based on user selections
        if (values.config) {
            args.push(`-c`, `${values.config}`);
        }

        if (values.quiet) {
            args.push(`-Q`);
        }

        if (values.verbose) {
            args.push(`-v`);
        }

        if (values.types) {
            args.push(`-t`, `${values.types}`);
        }

        if (checkedAdvanced) {
            if (values.indirectBlockDetection) {
                args.push(`-d`);
            }

            if (values.allHeaders) {
                args.push(`-a`);
            }

            if (values.auditFileOnly) {
                args.push(`-w`);
            }

            if (values.quickMode) {
                args.push(`-q`);
            }
        }

        try {
            // Execute the Foremost command and update the output state
            const output = await CommandHelper.runCommand("foremost", args);
            setOutput(output);
        } catch (e: any) {
            // In case of an error, update the output state with the error message
            setOutput(e);
        }

        setLoading(false);
    };

    // Clear the output state
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    // Render the GUI
    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack spacing="lg">
                {UserGuide(title, description_userguide)}
                {/* Advanced Mode Switch */}
                <Switch
                    label="Advanced Mode"
                    checked={checkedAdvanced}
                    onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                />
                {/* Input File/Device */}
                <TextInput
                    label={"Input File/Device"}
                    placeholder={"eg. /path/to/myfile/file.dd"}
                    required
                    {...form.getInputProps("input")}
                />
                {/* Output Directory */}
                <TextInput
                    label={"Output Directory"}
                    placeholder={"eg. path/to/output/folder"}
                    required
                    {...form.getInputProps("outputDir")}
                />
                {/* File Types */}
                <TextInput
                    label={"File Types"}
                    placeholder={"Specify types (comma-separated) e.g., jpg,doc. if blank will retrieve all."}
                    {...form.getInputProps("types")}
                />
                <Stack spacing="lg">
                    {/* Quiet Mode */}
                    <Checkbox
                        label={"Quiet Mode - enables quiet mode. Suppress output messages."}
                        {...form.getInputProps("quiet" as keyof FormValuesType)}
                    />
                    {/* Verbose Mode */}
                    <Checkbox
                        label={"Verbose Mode - enables verbose mode. Logs all messages to screen."}
                        {...form.getInputProps("verbose" as keyof FormValuesType)}
                    />
                </Stack>

                {/* Advanced Options */}
                {checkedAdvanced && (
                    <Stack spacing="lg">
                        {/* Configuration File */}
                        <TextInput
                            label={"Configuration File"}
                            placeholder={"set configuration file to use (defaults to foremost.conf)"}
                            {...form.getInputProps("config")}
                        />
                        {/* Indirect Block Detection */}
                        <Checkbox
                            label={
                                "Indirect Block Detection - turn on indirect block detection (for UNIX file-systems)."
                            }
                            {...form.getInputProps("indirectBlockDetection" as keyof FormValuesType)}
                        />
                        {/* Write All Headers */}
                        <Checkbox
                            label={
                                "Write All Headers - write all headers, perform no error detection (corrupted files)."
                            }
                            {...form.getInputProps("allHeaders" as keyof FormValuesType)}
                        />
                        {/* Audit File Only */}
                        <Checkbox
                            label={
                                "Audit File Only - only write the audit file, do not write any detected files to the disk."
                            }
                            {...form.getInputProps("auditFileOnly" as keyof FormValuesType)}
                        />
                        {/* Quick Mode */}
                        <Checkbox
                            label={"Quick Mode - enables quick mode. Searches are performed on 512 byte boundaries."}
                            {...form.getInputProps("quickMode" as keyof FormValuesType)}
                        />
                    </Stack>
                )}
                {/* Submit Button */}
                <Button type={"submit"}>Run Foremost</Button>
                {/* Console Output */}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default ForemostTool;
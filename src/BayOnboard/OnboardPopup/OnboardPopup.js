// react imports
import { React, useState, useRef, useEffect } from "react";

// material-ui imports
import { Dialog, DialogContent } from "@mui/material";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

// react-icons imports
import { GrUndo } from "react-icons/gr";
import { FaMapMarkedAlt } from "react-icons/fa";
import { LuSettings2 } from "react-icons/lu";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaSortNumericDown } from "react-icons/fa";
import { MdOutlineCleaningServices } from "react-icons/md";
import { BsDot } from "react-icons/bs";
import { IoSettingsSharp } from "react-icons/io5";
import { AiOutlineExclamationCircle } from "react-icons/ai";

// project imports
import DynamicButton from "../components/DynamicButton";

// assets
import floorLayout from "../../assets/floor_layout.png";

// options
const brandsOptions = ["Zivame", "Clovia", "Amanté", "Jockey"];

const ITEM_HEIGHT = 48;

function OnboardPopup() {
  //! UseState constants
  const [popupOpen, setPopupOpen] = useState(false); // Open main dialog
  const [openConfigs, setOpenConfigs] = useState(null);
  const [realDimension, setRealDimension] = useState({
    width: 0,
    height: 0,
  }); // Real Image Dimensions
  const [plottedDimensions, setPlottedDimensions] = useState({
    width: 0,
    height: 0,
  }); // Plotted Image Dimensions
  const [drawing, setDrawing] = useState(false); // Mouse left button is pressed
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 }); // To Set the size of the Img parent div
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 }); // Img dist. from left wrt VP
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // Box starts drawing from
  const [endPos, setEndPos] = useState({ x: 0, y: 0 }); // Box stops drawing at
  const [bayId, setBayId] = useState(0); // Bay Number
  // const [predBoxes, setPredBoxes] = useState([]);
  const [boxProps, setBoxProps] = useState([]); // Stores the data to print the annotations
  const [scaledBoxProps, setScaledBoxProps] = useState([]); // Stores the annotation data to be sent through the API call
  const [hoveredBoxId, setHoveredBoxId] = useState(null); // Stores the ID of the Hovered bay
  const [popoverData, setPopoverData] = useState({});
  const [isAscendingOrder, setIsAscendingOrder] = useState(null);
  const [requiredSort, setRequiredSort] = useState(false);
  // const [popupId, setPopupId] = useState(null);

  //! UseRefs
  const imageRef = useRef(null);

  //! Functions
  // Undo button disable/enable function
  // const handleDisableToggle = () => {
  //   setIsDisabled(!isDisabled);
  // };

  // Main dialog open/close function
  const handlePopupToggle = () => {
    setPopupOpen(!popupOpen);
  };

  // Save button click function
  const handleClickSave = () => {
    console.log("Clicked Save", scaledBoxProps);
  };

  // open configs menu
  const openConfigsMenu = (event, boxData) => {
    setPopoverData(boxData);
    setOpenConfigs(event.currentTarget);
  };

  // close configs menu
  const closeConfigsMenu = () => {
    setBoxProps((prevData) =>
      prevData.map((item) =>
        item.id === popoverData.id ? { ...item, ...popoverData } : item
      )
    );
    setOpenConfigs(null);
  };

  // undo button
  const handleUndo = () => {
    if (boxProps.length > 0) {
      // const newRectangles = [...rectangles];
      const newBoxProps = [...boxProps];
      const newScaledBoxProps = [...scaledBoxProps];
      // newRectangles.pop(); // Remove the last object
      newBoxProps.pop(); // Remove the last object
      newScaledBoxProps.pop(); // Remove the last object
      // setRectangles(newRectangles);
      setBoxProps(newBoxProps);
      setScaledBoxProps(newScaledBoxProps);
      // setBayId(bayId - 1);
    }
  };

  // delete a plotted bay
  const handleDelete = (id) => {
    const updatedBoxProps = boxProps.filter((box) => box.id !== id);
    // setBayId(id - 1);
    setBoxProps(updatedBoxProps);
  };

  // change bay no.
  const handleInputChange = (index, field, value) => {
    if (field === "id") {
      const isDuplicate = boxProps.some(
        (box, i) => i !== index && box.id === value
      );

      if (isDuplicate) {
        alert("Two bays can't have same numbers");
        return;
      }
    }
    const updatedBoxProps = [...boxProps];
    updatedBoxProps[index][field] = value;
    setBoxProps(updatedBoxProps);
  };

  // change brand wrt bay

  const handleBrandChange = (id, newBrand) => {
    setBoxProps((prevBoxProps) =>
      prevBoxProps.map((item) =>
        item.id === id ? { ...item, brand: newBrand } : item
      )
    );
  };

  // change parts no.
  const handlePopoverInputChange = (key, value) => {
    setPopoverData((prevData) => ({
      ...prevData,
      [key]: value === "" ? 0 : parseInt(value),
    }));
  };

  const handlePopoverIncrement = (key) => {
    setPopoverData((prevData) => ({
      ...prevData,
      [key]: (prevData[key] || 0) + 1,
    }));
  };

  const handlePopoverDecrement = (key) => {
    setPopoverData((prevData) => ({
      ...prevData,
      [key]: Math.max((prevData[key] || 0) - 1, 0),
    }));
  };

  const handleSort = () => {
    const sortedBoxProps = [...boxProps].sort((a, b) => a.id - b.id);
    setBoxProps(sortedBoxProps);
    setRequiredSort(false);
  };

  const handleClear = () => {
    setBoxProps([]);
    // setBayId(0);
  };

  const checkAscendingOrder = (array) => {
    for (let i = 1; i < array.length; i++) {
      if (array[i].id < array[i - 1].id) {
        return false;
      }
    }
    return true;
  };

  const checkAndSort = (data) => {
    // Check if the array contains an object with id: 1 and it's not in the first index
    const hasId1NotInFirstIndex =
      data.some((item) => item.id === 1) && data[0].id !== 1;

    if (hasId1NotInFirstIndex) {
      // Sort the array based on the id property
      // return [...data].sort((a, b) => a.id - b.id);
      return true;
    }

    // Return the original array if the condition is not met
    return false;
  };

  const findMissingId = (array) => {
    if (array.length === 0 || array[0].id !== 1) {
      return 1; // Return 1 if the array is empty or if the first id is not 1
    }

    const sortedIds = array.map((item) => item.id).sort((a, b) => a - b);

    for (let i = 1; i < sortedIds.length; i++) {
      if (sortedIds[i] - sortedIds[i - 1] !== 1) {
        return sortedIds[i - 1] + 1;
      }
    }

    // If no missing id found, return the next number after the last id
    return sortedIds[sortedIds.length - 1] + 1;
  };

  //Find real, rendered dimensions & offset wrt VP of the image
  const findImgDimensions = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    const imgDiv = imageRef.current;
    const { width, height, left, top } = imgDiv.getBoundingClientRect();
    // console.log("Img dimensions", naturalWidth, naturalHeight);
    // console.log("Plotted dimensions", width, height);
    // const scalingFactor_width = width / naturalWidth;
    // const scalingFactor_height = height / naturalHeight;

    // setBoxProps(
    //   predBoxes.map((predBox) => {
    //     const { id, x1, x2, y1, y2 } = predBox;
    //     const x1_scaled = Math.ceil(x1 * scalingFactor_width) + left;
    //     const x2_scaled = Math.floor(x2 * scalingFactor_width) + left;
    //     const y1_scaled = Math.ceil(y1 * scalingFactor_height) + top;
    //     const y2_scaled = Math.floor(y2 * scalingFactor_height) + top;
    //     return {
    //       id: id,
    //       x1: x1_scaled,
    //       x2: x2_scaled,
    //       y1: y1_scaled,
    //       y2: y2_scaled,
    //       width: x2_scaled - x1_scaled,
    //       height: y2_scaled - y1_scaled,
    //     };
    //   })
    // );
    setImgSize({ ...imgSize, width: width, height: height });
    setRealDimension({ width: naturalWidth, height: naturalHeight });
    setPlottedDimensions({ width: width, height: height });
    setImgOffset({ x: left, y: top });
  };

  //? Annotation with mouse click functions
  const handleMouseDown = (event) => {
    event.preventDefault();
    setDrawing(true);
    const x = event.clientX;
    const y = event.clientY;
    setStartPos({ x: x, y: y });
    setEndPos({ x: x, y: y });
  };

  const handleMouseMove = (event) => {
    event.preventDefault();
    if (!drawing) {
      return;
    }

    let x = event.clientX;
    let y = event.clientY;

    if (drawing) {
      setEndPos({ x, y });
    }
  };
  const MINIMUM_AREA = 700;
  const handleMouseUp = () => {
    // setMissingId(result);
    if (drawing) {
      const result = findMissingId(boxProps);
      // console.log("ID", result);
      setDrawing(false);
      const width = Math.abs(endPos.x - startPos.x);
      const height = Math.abs(endPos.y - startPos.y);

      // Check if the area is greater than the minimum area
      if (width * height < MINIMUM_AREA) {
        alert("Rectangle area is too small. Please draw a larger rectangle.");
        return;
      }
      const box = {
        // id: bayId + 1,
        id: result,
        x1: Math.min(startPos.x, endPos.x),
        x2: Math.max(startPos.x, endPos.x),
        y1: Math.min(startPos.y, endPos.y),
        y2: Math.max(startPos.y, endPos.y),
        brand: "",
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      };
      // setRectangles((prevRectangles) => [...prevRectangles, rect]);
      // setBayId(bayId + 1);
      setBoxProps((prevBoxProps) => [...prevBoxProps, box]);
      // }
    }
  };

  //! useEffects

  useEffect(() => {
    const ascendingResult = checkAscendingOrder(boxProps);
    setIsAscendingOrder(ascendingResult);
    const sortRequired = checkAndSort(boxProps);
    // setRequiredSort(sortRequired);
    if (sortRequired) {
      handleSort();
    }
    const scale_factor_x = realDimension.width / plottedDimensions.width;
    const scale_factor_y = realDimension.height / plottedDimensions.height;

    const sortedBoxProps = [...boxProps].sort((a, b) => a.id - b.id);

    setScaledBoxProps(
      sortedBoxProps.map((boxProp) => {
        const { id, x1, x2, y1, y2, brand, left, right, top, bottom } = boxProp;
        const x1_scaled = Math.floor((x1 - imgOffset.x) * scale_factor_x);
        const x2_scaled = Math.ceil((x2 - imgOffset.x) * scale_factor_x);
        const y1_scaled = Math.floor((y1 - imgOffset.y) * scale_factor_y);
        const y2_scaled = Math.ceil((y2 - imgOffset.y) * scale_factor_y);
        return {
          id: id,
          x: x1_scaled,
          y: y1_scaled,
          width: x2_scaled - x1_scaled,
          height: y2_scaled - y1_scaled,
          configs: {
            brand: brand,
            left: left,
            right: right,
            top: top,
            bottom: bottom,
          },
        };
      })
    );
    // eslint-disable-next-line
  }, [boxProps]);

  return (
    <>
      {/*Map button*/}
      <button className="text-3xl text-emerald-500" onClick={handlePopupToggle}>
        <FaMapMarkedAlt />
      </button>

      {/*Dialog Popup*/}
      <Dialog
        fullScreen
        open={popupOpen}
        onClose={handlePopupToggle}
        PaperProps={{
          sx: {
            boxShadow: "none",
          },
        }}
      >
        <DialogContent
          className="overflow-y-auto scrollbar"
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            overflow: "hidden",
          }}
        >
          {/*Dialog Content*/}
          <div className="w-full h-full flex flex-col">
            {/*Header Content*/}
            <div className="w-full flex flex-row bg-stone-300 border-b border-gray-400 py-2.5 justify-between px-3">
              <div className="flex flex-col sm:flex-row space-y-1 space-x-0 sm:space-y-0 sm:space-x-4">
                <span
                  id="rubikFont"
                  className="text-xl self-start sm:self-center"
                >
                  Trends-NeoPhyte Test Store-Mumbai
                </span>
              </div>
              <div className="flex flex-col-reverse lg:flex-row gap-2">
                <DynamicButton
                  title="Clear"
                  icon={MdOutlineCleaningServices}
                  type={boxProps.length > 0 ? null : "disabled"}
                  onClick={handleClear}
                  toolTip={
                    boxProps.length > 0 ? "Undo last bay" : "No bays available"
                  }
                />
                <DynamicButton
                  title="Undo"
                  icon={GrUndo}
                  type={boxProps.length > 0 ? null : "disabled"}
                  onClick={handleUndo}
                  toolTip={
                    boxProps.length > 0 ? "Undo last bay" : "No bays available"
                  }
                />
                <DynamicButton
                  title="Save"
                  type="success"
                  onClick={handleClickSave}
                  toolTip="Save Changes"
                />
                <DynamicButton
                  title="Close"
                  type="error"
                  onClick={handlePopupToggle}
                  toolTip="Close"
                />
              </div>
            </div>
            {/*Annotation Content*/}
            <div className="flex-grow flex">
              <div className="flex-grow px-2 py-2 flex justify-center">
                <div
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`self-center w-[${imgSize.width}] h-[${imgSize.height}]`}
                >
                  <img
                    ref={imageRef}
                    onLoad={findImgDimensions}
                    src={floorLayout}
                    alt="img not found"
                    className="max-h-[86vh]"
                  />
                  {boxProps.map((box) => (
                    <div
                      key={box.id}
                      className={`absolute border-2 border-white cursor-not-allowed ${
                        hoveredBoxId === box.id
                          ? "border-lime-500 bg-lime-500 bg-opacity-[.3]"
                          : ""
                      }`}
                      style={{
                        left: box.x1,
                        top: box.y1,
                        width: box.width,
                        height: box.height,
                      }}
                    >
                      <span className="relative text-white -top-6 left-1">
                        Bay {box.id}
                      </span>
                      <div className="absolute text-white -bottom-6 left-1">
                        {box.brand}
                      </div>
                    </div>
                  ))}
                  {drawing && (
                    <div
                      className="absolute border-2 border-green-500"
                      style={{
                        left: Math.min(startPos.x, endPos.x),
                        top: Math.min(startPos.y, endPos.y),
                        width: Math.abs(endPos.x - startPos.x),
                        height: Math.abs(endPos.y - startPos.y),
                      }}
                    />
                  )}
                </div>
              </div>
              {/*Table Content*/}
              <Card className="">
                <div className="w-[385px] h-[90vh] overflow-y-auto scrollbar">
                  <Table stickyHeader sx={{ width: "100%" }}>
                    <TableHead sx={{ "& th": { backgroundColor: "#f1f5f9" } }}>
                      <TableRow>
                        <TableCell align="center" className="w-[32.5%]">
                          Bay No.
                          {!isAscendingOrder && (
                            <Tooltip title={"Sort"}>
                              <button className="relative" onClick={handleSort}>
                                <FaSortNumericDown className="ml-1 text-emerald-600 hover:text-emerald-700 text-sm" />
                                <BsDot className="absolute -top-2 -right-3 text-lg text-emerald-500 animate-ping" />
                              </button>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell align="center" className="w-[36%]">
                          Brand
                        </TableCell>
                        <TableCell align="center" className="w-[32.5%]">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {boxProps.map((box, index) => (
                        <TableRow key={index} className="hover:bg-slate-100">
                          <TableCell align="center">
                            <input
                              type="number"
                              value={box.id}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "id",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-12 h-10 outline-none focus:border-blue-500 focus:border-2 text-center border rounded border-gray-400"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <FormControl
                              size="small"
                              sx={{
                                width: "106px",
                              }}
                              fullWidth
                            >
                              <InputLabel>Select</InputLabel>
                              <Select
                                value={box.brand}
                                label="Select"
                                onChange={(e) =>
                                  handleBrandChange(box.id, e.target.value)
                                }
                              >
                                {brandsOptions.map((brand) => (
                                  <MenuItem key={brand} value={brand}>
                                    {brand}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell align="center">
                            <div className="flex justify-center space-x-3">
                              <Tooltip title={"Configuration"}>
                                <IconButton
                                  onClick={(e) => openConfigsMenu(e, box)}
                                >
                                  <IoSettingsSharp className="text-xl text-emerald-500" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={"Delete"}>
                                <IconButton
                                  onClick={() => handleDelete(box.id)}
                                >
                                  <MdDelete className="text-2xl text-red-500" />
                                </IconButton>
                              </Tooltip>
                            </div>

                            <Popover
                              open={!!openConfigs}
                              anchorEl={openConfigs}
                              onClose={closeConfigsMenu}
                              anchorOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                              PaperProps={{
                                style: {
                                  maxHeight: ITEM_HEIGHT * 7,
                                  width: "23ch",
                                  paddingTop: "3px",
                                  paddingBottom: "4px",
                                },
                              }}
                            >
                              <div className="w-full flex">
                                <div className="w-1/2 pt-2 pb-1">
                                  <span className="pl-3 font-semibold text-gray-500">
                                    Aisle
                                  </span>
                                </div>
                                <div className="w-1/2 py-2">
                                  <span className="pl-5 font-semibold text-gray-500">
                                    Shelves
                                  </span>
                                </div>
                              </div>
                              <div className="w-full border border-gray-200"></div>
                              <div className="w-full flex flex-col space-y-2 my-3 px-3">
                                <div className="w-full flex">
                                  <span className="text-base w-1/2 self-center">
                                    Left
                                  </span>
                                  <div className="w-1/2 flex justify-center">
                                    <div className="flex w-[90px] h-full space-x-4 border border-gray-200 px-2 py-1 rounded">
                                      <FaMinus
                                        onClick={(e) =>
                                          handlePopoverDecrement("left")
                                        }
                                        className="self-center cursor-pointer text-sm text-red-500"
                                      />
                                      <input
                                        className="outline-none w-6 text-center h-5"
                                        placeholder="0"
                                        onChange={(e) =>
                                          handlePopoverInputChange(
                                            "left",
                                            e.target.value
                                          )
                                        }
                                        value={popoverData.left || ""}
                                        type="number"
                                      />
                                      <FaPlus
                                        onClick={(e) =>
                                          handlePopoverIncrement("left")
                                        }
                                        className="self-center cursor-pointer text-sm text-emerald-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full flex flex-col space-y-2 my-3 px-3">
                                <div className="w-full flex">
                                  <span className="text-base w-1/2 self-center">
                                    Right
                                  </span>
                                  <div className="w-1/2 flex justify-center">
                                    <div className="flex w-[90px] h-full space-x-4 border border-gray-200 px-2 py-1 rounded">
                                      <FaMinus
                                        onClick={(e) =>
                                          handlePopoverDecrement("right")
                                        }
                                        className="self-center cursor-pointer text-sm text-red-500"
                                      />
                                      <input
                                        className="outline-none w-6 text-center h-5"
                                        placeholder="0"
                                        onChange={(e) =>
                                          handlePopoverInputChange(
                                            "right",
                                            e.target.value
                                          )
                                        }
                                        value={popoverData.right || ""}
                                        type="number"
                                      />
                                      <FaPlus
                                        onClick={(e) =>
                                          handlePopoverIncrement("right")
                                        }
                                        className="self-center cursor-pointer text-sm text-emerald-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full flex flex-col space-y-2 my-3 px-3">
                                <div className="w-full flex">
                                  <span className="text-base w-1/2 self-center">
                                    Top
                                  </span>
                                  <div className="w-1/2 flex justify-center">
                                    <div className="flex w-[90px] h-full space-x-4 border border-gray-200 px-2 py-1 rounded">
                                      <FaMinus
                                        onClick={(e) =>
                                          handlePopoverDecrement("top")
                                        }
                                        className="self-center cursor-pointer text-sm text-red-500"
                                      />
                                      <input
                                        className="outline-none w-6 text-center h-5"
                                        placeholder="0"
                                        onChange={(e) =>
                                          handlePopoverInputChange(
                                            "top",
                                            e.target.value
                                          )
                                        }
                                        value={popoverData.top || ""}
                                        type="number"
                                      />
                                      <FaPlus
                                        onClick={(e) =>
                                          handlePopoverIncrement("top")
                                        }
                                        className="self-center cursor-pointer text-sm text-emerald-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full flex flex-col space-y-2 mt-3 mb-2 px-3">
                                <div className="w-full flex">
                                  <span className="text-base w-1/2 self-center">
                                    Bottom
                                  </span>
                                  <div className="w-1/2 flex justify-center">
                                    <div className="flex w-[90px] h-full space-x-4 border border-gray-200 px-2 py-1 rounded">
                                      <FaMinus
                                        onClick={(e) =>
                                          handlePopoverDecrement("bottom")
                                        }
                                        className="self-center cursor-pointer text-sm text-red-500"
                                      />
                                      <input
                                        className="outline-none w-6 text-center h-5"
                                        placeholder="0"
                                        onChange={(e) =>
                                          handlePopoverInputChange(
                                            "bottom",
                                            e.target.value
                                          )
                                        }
                                        value={popoverData.bottom || ""}
                                        type="number"
                                      />
                                      <FaPlus
                                        onClick={(e) =>
                                          handlePopoverIncrement("bottom")
                                        }
                                        className="self-center cursor-pointer text-sm text-emerald-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Popover>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={requiredSort}>
        <DialogContent className="">
          <div className="w-full h-full flex flex-col space-y-4 m-auto">
            <div className="m-auto text-5xl">
              <AiOutlineExclamationCircle className="text-amber-500" />
            </div>
            <div id="poppinsFont" className="m-auto flex flex-col space-y-3">
              <span className="text-xl text-wrap text-center self-center">
                {" "}
                Sorting the table is required <br /> before plotting bays
                further
              </span>
              <span className=" text-sm text-gray-600 self-center">
                (Please click sort to continue)
              </span>
            </div>
            <Box sx={{ "& button": { m: 1 } }}>
              <div className="w-full flex justify-center">
                <button
                  id="poppinsFont"
                  className="w-24 py-1 rounded-md shadow-md bg-amber-500 text-white"
                  onClick={handleSort}
                >
                  Sort
                </button>
              </div>
            </Box>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OnboardPopup;

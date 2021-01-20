# t55_t75_knx_rf_decoder
This project revolves around receiving and decoding the KNX RF signal sent from the Uponor T-55 and T-75 thermostats in connection with the Uponor C-55 Controller.
These are all legacy products which have gone out of production, but used versions are readily available on various marketplaces.

## What is KNX-RF
KNX-RF is a well defined protocol and easy to understand, the specification is [publicly available here](https://my.knx.org/shop/product?product_type_category=knx_specifications&product_type=knx-specifications).

## How to receive KNX-RF
There are surely many ways which the KNX-RF signal can be received.
This project uses a TV tuner with the RTL2832U chip in connection with the [rtl_433](https://github.com/merbanan/rtl_433) project.

If you're running on Windows and the tuner is not found, it is likely you need to overwrite the driver with WinUSB.

The following command is the most basic one can be used to receive KNX-RF signals using rtl_433
```
rtl_433 -f 868.3M -s 1024k
```
Notice that the command is tuned to `868.3 MHz` which is for the EU region, KNX-RF may be using `433 MHz` in your region.

## Decoding the KNX-RF data
The Uponor T-55 and T-75 thermostats sends two different signals of different sizes, one with 6 data octets and one with 8 data octets.
rtl_433 decodes the majority of the received KNX-RF signal, here is an example data string that has not yet been decoded `1144ff030074026009ec0005ff0001e800800cad7a14`

**Important** rtl_433 strips the CRC octets from both block 1 and block 2. 

| Block 1  | Block 2 |
| ------------- | ------------- |
| 1144ff030074026009ec | 0005ff0001e800800cad7a14 |

Decoding the data gives us the following data

| Value | Decoded into |
| ------------- | ------------- |
| 11 | Length of the telegram = 17 |
| 44 | Static value that never changes |
| FF | Static value that never changes |
| 03 | RF-Info, converted into bits: `00000011`, bit 6 (zero-indexed) is the battery state (`0` = battery is weak, `1` = OK), so battery state = `OK` |
| 0074026009ec | The serial number of the thermostat. It appears that `00740` are T-75 thermostats, and `00744` are T-55 thermostats |



Receive and decode the KNX RF signal sent from the Uponor T-55 and T-75 thermostats

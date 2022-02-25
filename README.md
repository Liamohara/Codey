# Codey

> A simple, no-nonsense Python IDE.

<img src="./screenshot.png" width="864">

---

## Getting Started

### Download Repo
Clone this repo to a folder on your device. Here we'll use `$HOME/codey`(MacOS/Linux) and `%userprofile%/codey`(Windows).
* MacOS/Linux
```sh
git clone https://github.com/Liamohara/Codey.git "$HOME/codey"
```
* Windows
```sh
cd /D %userprofile%
git clone https://github.com/Liamohara/Codey.git codey
```
### Install
1. Ensure that [Node.js](https://nodejs.org/en/download/) is installed.
2. Open the directory where you have installed the source code.
* MacOS/Linux
```sh
cd $HOME/codey/
```
* Windows
```sh
cd /D %userprofile%/codey/
```
3. Install the dependencies.
```sh
npm install
```
4. Run Codey.
```sh
npm run start
```
5. Package the application and generate binaries.
```sh
npm run package
```
6. The binaries have now been saved to `./out`!
* MacOS/Linux
```sh
cd $HOME/codey/dist/
ls
```
* Windows
```sh
cd /D %userprofile%/codey/dist/
dir
```
7. Copy the application from the `./out` directory to your applications folder.
* MacOS/Linux
```sh
cp -r Codey-darwin-x64/Codey.app /Applications/
```
* Windows
```sh
cp ... C:/"Program Files"
```

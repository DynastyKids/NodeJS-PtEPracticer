# PTE English Test Listening emulator

This is an self-hobby project that utilising Electron and Azure Speech Service to practice for PTE tests. With Azure AI assisted in speech service.

## To build yourselves a database

### MongoDB format
Under your Database, you should contain 4 collections, they are `listening`, `reading`, `speaking` and `writing`.

In each collection, it holds following fields:
```
questionId: Identitication number of question ID, String format
isPredict: This question is Prediction for next exam. Boolean format, *Not in Use*
questionText: Question text to be display on screen for candidates, String format
questionLevel: You can define the level of hardness of this question by yourself, Int32 format
questionCategory: The question type of this question. String format with capatial size in abbervation only, e.g.: Write From Dictation => WFD
```

CREATE TABLE Presses(
	Id int8 NOT NULL GENERATED ALWAYS AS IDENTITY,
	Name text NOT NULL,
	PRIMARY KEY(Id)
);

CREATE TABLE Operators(
	Id int8 NOT NULL GENERATED ALWAYS AS IDENTITY,
	Name text NOT NULL,
	PRIMARY KEY(Id)
);

CREATE TABLE Inks(
	Id int8 NOT NULL GENERATED ALWAYS AS IDENTITY,
	Name text NOT NULL,
	PRIMARY KEY(Id)
);

CREATE TABLE Items(
	Id int8 NOT NULL GENERATED ALWAYS AS IDENTITY,
	Name text NOT NULL,
	PRIMARY KEY(Id)
);

CREATE TABLE Batches(
	Id int8 NOT NULL GENERATED ALWAYS AS IDENTITY,
	ItemId text,
	Type text,
	Urgency text,
	CreatedDate timestamp NOT NULL,
	LastEditedDate timestamp NOT NULL,
	ScheduledDate timestamp,
	PaperWeight text,
	Description text,
	Comments text,
	NumberPerSheet text,
	ParentSheet text,
	FinishedSheetSize text,
	PaperPackaging text,
	PressOperator text,
	CompletedDate timestamp,
	RunByDate timestamp,
	ShipDate timestamp,
	QuantityRequested int8,
	QuantityPrinted int8,
	PressId int8,
    IsCompleted boolean,
	Ink1Name text,
	Ink1Quantity int8,
	Ink2Name text,
	Ink2Quantity int8,
	Ink3Name text,
	Ink3Quantity int8,
	Ink4Name text,
	Ink4Quantity int8,
	PRIMARY KEY(Id),
	CONSTRAINT fk_Press
	FOREIGN KEY(PressId)
	REFERENCES Presses(Id)
);

package com.programmingfree.springservice;

import org.springframework.data.annotation.Id;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Task {

	@Id
	private int id;
	
	private String taskName;
	private String taskDescription;
	private String taskPriority;
	private String taskStatus;
	private int taskArchived = 0;
}


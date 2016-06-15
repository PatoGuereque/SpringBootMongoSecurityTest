package com.programmingfree.springservice;

import org.springframework.data.annotation.Id;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Account {

	@Id
	private String id;
	private String username;
	private String password;
	private String role;

	public Account() {
	}

	public Account(String username, String password, String role) {
		this.username = username;
		this.password = password;
		this.role = role;
	}
}